export default {
    $in: (_filter, _element) => {
        return (
            _filter.$in &&
            _filter.$in.length &&
            _filter.$in.indexOf(_element) !== -1
        );
    },
    regexp: (_filter, _element) => {
        return (
            _filter instanceof RegExp &&
            _filter.test(_element)
        );
    },
    equals: (_filter, _element) => {
        return _element === _filter;
    }
};