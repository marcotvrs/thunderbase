const DeepSearch = (_splitedKeys, _element, _deep) => {
    if (_deep === _splitedKeys.length) return _element;
    if (!_element[_splitedKeys[_deep]]) return undefined;
    return DeepSearch(_splitedKeys, _element[_splitedKeys[_deep]], _deep + 1);
};

export default (_key, _element) => {
    if (_key.indexOf(".") === -1) return _element[_key];
    return DeepSearch(_key.split("."), _element, 0);
};