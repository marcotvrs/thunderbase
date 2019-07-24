import Utils from './Utils';
import DeepSearch from './DeepSearch';
import Operators from './Operators';

const miner = (_keys, _filter, _element) => {
    return _keys.filter((key) => (
        Operators.regexp(_filter[key], DeepSearch(key, _element)) ||
        Operators.$in(_filter[key], DeepSearch(key, _element)) ||
        Operators.equals(_filter[key], DeepSearch(key, _element))
    )).length;
};

export default (_filter, _data, _options) => {
    if (Utils.isEmpty(_filter)) return _data;
    if (Utils.isEmpty(_options)) _options = {};
    const filterFunction = (element) => {
        let _keys = Utils.cleanOperators(_filter);
        let exists = miner(_keys, _filter, element) === _keys.length;
        if (!Utils.isEmpty(_filter.$not) && exists)
            return miner(Utils.cleanOperators(_filter.$not), _filter.$not, element) === 0;
        if (!Utils.isEmpty(_filter.$or) && exists)
            return miner(Utils.cleanOperators(_filter.$or), _filter.$or, element) >= 1;
        return exists;
    };
    if (_options.onlyOne) return _data.find(filterFunction);
    return _data.filter(filterFunction);
};