define(["app"], function (app) {
    'use strict';

    app.filter("pronoun", pronoun);

    function pronoun() {
        return function(input){
            if (input === "f")
                return "she";

            if (input === "m")
                return "he";

            return "";
        }
    }
});