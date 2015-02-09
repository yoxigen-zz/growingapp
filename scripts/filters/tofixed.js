define(["app"], function (app) {
    'use strict';

    app.filter("toFixed", toFixed);

    var decimalMatch = /^(\d+\.)(\d+)$/;

    function toFixed() {
        return function(input, decimalPoints){
            var str = String(input),
                match = str.match(decimalMatch);

            if (!match)
                return input;

            return match[1] + match[2].substr(0, decimalPoints);
        }
    }
});