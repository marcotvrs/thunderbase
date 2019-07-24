import ObjectID from 'bson-objectid';
import Filter from './Filter';
import Sorter from './Sorter';
import Utils from './Utils';
import LargeStorage from './LargeStorage';
import Listeners from './Listeners';

export default (_collection) => {
    const performData = async (_filter) => {
        try {
            let data = [];
            if (!Utils.isEmpty(_filter) && _filter._id && typeof _filter._id === "string") {
                data = await LargeStorage(_collection).getItem(_filter._id)
                if (data.error)
                    throw data.error;
                return [data];
            }
            return await LargeStorage(_collection).getItems();
        } catch (error) {
            return { error };
        }
    };

    const find = async (_filter, _sorter, _options) => {
        try {
            if (typeof _filter === "string")
                return await LargeStorage(_collection).getItem(_filter);

            let data = await performData(_filter);
            if (data.error)
                throw data.error;

            if (_options.onlyOne)
                return Filter(_filter, data, { onlyOne: true });
            return Sorter(_sorter, Filter(_filter, data, _options));
        } catch (error) {
            return { error };
        }
    };

    const onSnapshot = async (_filter, _sorter, _options, _cb) => {
        try {
            let index = Math.random();
            await _cb(await find(_filter, _sorter, _options));
            Listeners(_collection).set(index, async () => await _cb(await find(_filter, _sorter, _options)));
            this.close = () => Listeners(_collection).remove(index);
            return this;
        } catch (error) {
            return { error };
        }
    };

    this.find = (_filter, _sorter) => {
        this.get = async () => {
            return await find(_filter, _sorter, {});
        };
        this.onSnapshot = async (_cb) => {
            return await onSnapshot(_filter, _sorter, {}, _cb);
        };
        return this;
    };

    this.findOne = (_filter) => {
        this.get = async () => {
            return await find(_filter, {}, { onlyOne: true });
        };
        this.onSnapshot = async (_cb) => {
            return await onSnapshot(_filter, {}, { onlyOne: true }, _cb);
        };
        return this;
    };

    this.insert = async (_documents) => {
        try {
            if (Utils.isEmpty(_documents))
                throw new TypeError("The parameter '_documents' is required.");

            if (!Array.isArray(_documents))
                return this.insertOne(_documents);

            let data = [];
            let insertedIds = [];
            for (let i = 0; i < _documents.length; i++) {
                let _id = _documents[i]._id ? _documents[i]._id : ObjectID().toString();
                insertedIds.push(_id);
                data.push({
                    _id,
                    ..._documents[i],
                    updatedAt: new Date(),
                    createdAt: new Date()
                });
            }

            let storage = await LargeStorage(_collection).insertItems(data);
            if (storage.error)
                throw storage.error;

            return { insertedIds };
        } catch (error) {
            return { error };
        }
    };

    this.insertOne = async (_document) => {
        try {
            if (Utils.isEmpty(_document))
                throw new TypeError("The parameter '_document' is required.");

            if (Array.isArray(_document))
                throw new TypeError("The parameter '_document' must be a object.");

            let _id = _document._id ? _document._id : ObjectID().toString();
            let storage = await LargeStorage(_collection).insertItem({
                _id,
                ..._document,
                updatedAt: new Date(),
                createdAt: new Date()
            });
            if (storage.error)
                throw storage.error;

            return { insertedId: _id };
        } catch (error) {
            return { error };
        }
    };

    this.update = async (_filter, _update, _options) => {
        try {
            if (Utils.isEmpty(_update))
                throw new TypeError("The parameter '_update' is required.");

            if (Utils.isEmpty(_options))
                _options = {};

            _update = { ..._update, updatedAt: new Date() };

            if (typeof _filter === "string") {
                let data = await LargeStorage(_collection).getItem(_filter);
                if (data.error)
                    throw data.error;
                if (!Object.keys(data).length)
                    return { success: true };
                return await LargeStorage(_collection).updateItem({ ...data, ..._update });
            }

            let data = await performData(_filter);
            if (data.error)
                throw data.error;

            if (!data.length)
                return { success: true };

            if (Utils.isEmpty(_filter)) {
                let max = _options.multi ? data.length : 1;
                for (let i = 0; i < max; i++)
                    Object.assign(data[i], _update);
                return await LargeStorage(_collection).updateItems(data);
            }

            let filtereds = Filter(_filter, data, {});
            if (!filtereds.length)
                return { success: true };
            let max = _options.multi ? filtereds.length : 1;
            for (let i = 0; i < max; i++)
                Object.assign(filtereds[i], _update);

            return await LargeStorage(_collection).updateItems(filtereds);
        } catch (error) {
            return { error };
        }
    };

    this.remove = async (_filter, _options) => {
        try {
            if (Utils.isEmpty(_options))
                _options = {};

            if (typeof _filter === "string")
                return await LargeStorage(_collection).removeItem({ _id: _filter });

            if (Utils.isEmpty(_filter) && _options.multi)
                return await LargeStorage(_collection).removeAllItems();

            let data = await performData(_filter);
            if (data.error)
                throw data.error;

            let filtereds = Filter(_filter, data);
            if (!filtereds.length)
                return { success: true };

            if (_options.multi)
                return LargeStorage(_collection).removeItems(filtereds);
            return LargeStorage(_collection).removeItem(filtereds[0]);
        } catch (error) {
            return { error };
        }
    };

    this.import = async (_values) => {
        try {
            return await LargeStorage(_collection).importItems(_values);
        } catch (error) {
            return { error };
        }
    };

    return this;
};