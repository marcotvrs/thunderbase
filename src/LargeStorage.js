import { AsyncStorage } from 'react-native';
import Listeners from './Listeners';

let _prefix = "4ECQ3";
let _keys = {};

export default (_collection) => {
    const getKeys = async () => {
        try {
            if (!!_keys[_collection] && !!_keys[_collection].length) return _keys[_collection];
            _keys[_collection] = [];
            let aux = {};
            let keyName = null;
            let keys = await AsyncStorage.getAllKeys();
            for (let i = 0; i < keys.length; i++) {
                if (keys[i].substring(0, _prefix.length) !== _prefix || keys[i].indexOf(":") === -1) continue;
                keyName = keys[i].match(/:(.*):/)[1];
                if (!aux[keyName]) aux[keyName] = {};
                aux[keyName][keys[i]] = true;
            }
            for (let collection in aux)
                _keys[collection] = Object.keys(aux[collection])
            return _keys[_collection];
        } catch (error) {
            return { error };
        }
    };

    this.getItem = async (_id) => {
        try {
            let data = await AsyncStorage.getItem(`${_prefix}:${_collection}:${_id}`);
            if (!data) return {};
            return JSON.parse(data);
        } catch (error) {
            return { error };
        }
    };

    this.getItems = async () => {
        try {
            let keys = await getKeys();
            let values = await AsyncStorage.multiGet(keys);
            let data = [];
            for (let i = 0; i < values.length; i++)
                data.push(JSON.parse(values[i][1]));
            return data;
        } catch (error) {
            return { error };
        }
    };

    this.insertItem = async (_value) => {
        try {
            await getKeys();
            let key = `${_prefix}:${_collection}:${_value._id}`;
            let index = _keys[_collection].indexOf(key);
            if (index === -1) _keys[_collection].push(key);
            await AsyncStorage.setItem(key, JSON.stringify(_value));
            Listeners(_collection).invoke();
            return { success: true };
        } catch (error) {
            return { error };
        }
    };

    this.insertItems = async (_values) => {
        try {
            await getKeys();
            let data = [];
            let keys = [];
            for (let i = 0; i < _values.length; i++) {
                data.push([`${_prefix}:${_collection}:${_values[i]._id}`, JSON.stringify(_values[i])]);
                keys.push(`${_prefix}:${_collection}:${_values[i]._id}`);
            }
            _keys[_collection] = Array.from(new Set([..._keys[_collection], ...keys]));
            await AsyncStorage.multiSet(data);
            Listeners(_collection).invoke();
            return { success: true };
        } catch (error) {
            return { error };
        }
    };

    this.updateItem = async (_value) => {
        try {
            await AsyncStorage.setItem(`${_prefix}:${_collection}:${_value._id}`, JSON.stringify(_value));
            Listeners(_collection).invoke();
            return { success: true };
        } catch (error) {
            return { error };
        }
    };

    this.updateItems = async (_values) => {
        try {
            let data = _values.map((item) => [`${_prefix}:${_collection}:${item._id}`, JSON.stringify(item)]);
            await AsyncStorage.multiSet(data);
            Listeners(_collection).invoke();
            return { success: true };
        } catch (error) {
            return { error };
        }
    };

    this.importItems = async (_values) => {
        try {
            let keys = await getKeys();
            if (keys.length) {
                await AsyncStorage.multiRemove(keys);
                delete _keys[_collection];
            }

            let data = [];
            for (let i = 0; i < _values.length; i++)
                data[i] = [`${_prefix}:${_collection}:${_values[i]._id}`, JSON.stringify(_values[i])];

            await AsyncStorage.multiSet(data);
            return { success: true };
        } catch (error) {
            return { error };
        }
    };

    this.removeItem = async (_item) => {
        try {
            await getKeys();
            let key = `${_prefix}:${_collection}:${_item._id}`;
            let index = _keys[_collection].indexOf(key);
            _keys[_collection].splice(index, 1);
            await AsyncStorage.removeItem(key);
            Listeners(_collection).invoke();
            return { success: true };
        } catch (error) {
            return { error };
        }
    };

    this.removeItems = async (_items) => {
        try {
            await getKeys();
            let keys = _items.map((item) => `${_prefix}:${_collection}:${item._id}`);
            _keys[_collection] = _keys[_collection].filter((key) => keys.indexOf(key) === -1);
            await AsyncStorage.multiRemove(keys);
            Listeners(_collection).invoke();
            return { success: true };
        } catch (error) {
            return { error };
        }
    };

    this.removeAllItems = async () => {
        try {
            await getKeys();
            await AsyncStorage.multiRemove(_keys[_collection]);
            delete _keys[_collection];
            Listeners(_collection).invoke();
            return { success: true };
        } catch (error) {
            return { error };
        }
    };

    return this;
};