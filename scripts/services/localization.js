angular.module("Localization", []).factory("localization", function(){
	var units = {
		"date": {
			all: [
				{ "display": "Dec 24, 2014", "name": "MMM DD, YYYY" },
				{ "display": "12/24/2014", "name": "MM/DD/YYYY" },
				{ "display": "24/12/2014", "name": "DD/MM/YYYY" }
			],
			"selected": "MMM DD, YYYY"
		},
		height: {
			all: [
				{ "name": "cm", "display": "cm", "multiplier": 1 },
				{ "name": "inches", "display": "″", "multiplier": 2.54 }
			],
			selected: "cm"
		},
		weight: {
			all: [
				{ "name": "kg", "display": "kg", "multiplier": 1 },
				{ "name": "lb", "display": "lbs", "multiplier": 0.453592 }
			],
			selected: "kg"
		}
	};

	var unitsIndex = {},
		unitIndex;

	for(var type in units){
		unitIndex = unitsIndex[type] = {};
		units[type].all.forEach(function(unit){
			unitIndex[unit.name] = unit;
		});
	}

	return {
		convertFromUnit: convertFromUnit,
		convertToUnit: convertToUnit,
		getLocalizationDefaults: function(){ return angular.copy(units); },
		get units(){
			return unitsIndex;
		}
	};

	/**
	 * Converts a unit value to another unit of measure
	 * @param type The unit type, "height", "weight", etc
	 * @param value The current value - this is the value in the default unit - cm for height, kg for weight
	 * @param targetUnit The unit to convert the value into. For example, if the targetUnit is "inches" (for height type), and the value is 2.54, the return value is 1.
	 * @returns {number}
	 */
	function convertToUnit(type, value, targetUnit){
		var unitType = unitsIndex[type];
		if (!unitType)
			throw new Error("Unknown unit type, '" + type + "'.");

		return value * unitType[targetUnit].multiplier;
	}

	/**
	 * The reverse of convertToUnit
	 */
	function convertFromUnit(type, value, targetUnit){
		var unitType = unitsIndex[type];
		if (!unitType)
			throw new Error("Unknown unit type, '" + type + "'.");

		return value / unitType[targetUnit].multiplier;
	}
});