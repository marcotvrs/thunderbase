import sort from 'fast-sort';
import Utils from './Utils';

export default (_sorter, _data) => {
    if (Utils.isEmpty(_sorter)) return _data;
    return sort(_data).by(_sorter);
};