define(["app"], function (app) {
    'use strict';

    app.filter("unit", unit);
    unit.$inject = ["localization", "config"];

    function unit(localization, config) {
        return function(input, unitType,reverse){
            var currentUnit = config.localization[unitType].selected,
                convertMethod = reverse ? localization.convertToUnit : localization.convertFromUnit;

            return convertMethod(unitType, input, currentUnit).toFixed(2);
        }
    }
});