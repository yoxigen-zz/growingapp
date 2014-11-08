angular.module("Localization", []).factory("localization", function(){
	var units = {
		height: {
			cm: 1,
			"inches": 2.54
		},
		weight: {
			kg: 1,
			"lb": 0.453592
		}
	};

	return {
		convertFromUnit: convertFromUnit,
		convertToUnit: convertToUnit
	};

	/**
	 * Converts a unit value to another unit of measure
	 * @param type The unit type, "height", "weight", etc
	 * @param value The current value - this is the value in the default unit - cm for height, kg for weight
	 * @param targetUnit The unit to convert the value into. For example, if the targetUnit is "inches" (for height type), and the value is 2.54, the return value is 1.
	 * @returns {number}
	 */
	function convertToUnit(type, value, targetUnit){
		var unitType = units[type];
		if (!unitType)
			throw new Error("Unknown unit type, '" + type + "'.");

		return value * unitType[targetUnit];
	}

	/**
	 * The reverse of convertToUnit
	 */
	function convertFromUnit(type, value, targetUnit){
		var unitType = units[type];
		if (!unitType)
			throw new Error("Unknown unit type, '" + type + "'.");

		return value / unitType[targetUnit];
	}
});