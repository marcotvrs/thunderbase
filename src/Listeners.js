let _listeners = {};

export default (_collection) => {
    this.set = (_index, _cb) => {
        if (!_listeners[_collection]) _listeners[_collection] = {};
        _listeners[_collection][_index] = _cb;
    };
    this.remove = (_index) => {
        delete _listeners[_collection][_index];
    };
    this.invoke = () => {
        if (!_listeners[_collection]) return;
        Object.values(_listeners[_collection]).forEach((cb) => cb());
    };
    return this;
};