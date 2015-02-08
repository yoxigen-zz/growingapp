app.filter("unit", ["localization", "config", function(localization, config){
	return function(input, unitType,reverse){
		var currentUnit = config.localization[unitType].selected,
			convertMethod = reverse ? localization.convertToUnit : localization.convertFromUnit;

		return convertMethod(unitType, input, currentUnit).toFixed(2);
	}
}]);