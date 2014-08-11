window.manic.Enum = (function () {
    function Enum (keyValuePairs) {
        var valueKeyPairs = {};
        for (var key in keyValuePairs) {
            if (keyValuePairs.hasOwnProperty(key)) {
                this[key] = keyValuePairs[key];
                valueKeyPairs[keyValuePairs[key]] = key;
            }
        }
        this.getKey = function (value) {
            return valueKeyPairs[value];
        };
    }
    return Enum;
}());