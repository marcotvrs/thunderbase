export default {
    isEmpty: (_value) => {
        switch (typeof _value) {
            case "string":
                return !_value.length;
            case "object":
                return !Object.keys(_value).length;
            case "undefined":
                return true;
        }
    },
    cleanOperators: (_filter) => {
        let _keys = Object.keys(_filter);
        return _keys.filter((key) => ["$not", "$or"].indexOf(key) === -1);
    }
};