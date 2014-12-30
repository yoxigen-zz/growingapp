app.factory("entries", ["utils", "localization", "config", "$filter", function entriesFactory(utils, localization, config, $filter){
    var unitFilter = $filter("unit");
    var entryTypes = [
        {
            "id": "photo",
            "name": "Photo",
            "icon": "photo"
        },
        {
            "id": "note",
            "name": "Note",
            "icon": "note",
            color: "#4e7dbc",
            allowDescription: false
        },
        {
            "id": "weight",
            "name": "Weight",
            "icon": "weight",
            color: "#397a42",
            "prepareForEdit": function(entry){
                var convertMethod = localization.convertFromUnit;
                entry.properties.weight = parseFloat(convertMethod("weight", entry.properties.value || entry.properties.weight, config.localization.weight.selected).toFixed(2));
            },
            "preSave": function(entry){
                entry.properties.value = localization.convertToUnit("weight", entry.properties.weight, config.localization.weight.selected);
            },
            "localizationDependencies": ["weight"]
        },
        {
            "id": "height",
            "name": "Height",
            "icon": "height",
            color: "#139798",
            "prepareForEdit": function(entry){
                var convertMethod = localization.convertFromUnit;
                entry.properties.height = parseFloat(convertMethod("height", entry.properties.value || entry.properties.height, config.localization.height.selected).toFixed(2));
            },
            "preSave": function(entry){
                entry.properties.value = localization.convertToUnit("height", entry.properties.height, config.localization.height.selected);
            },
            "localizationDependencies": ["height"]
        },
        {
            "id": "milestone",
            "name": "Milestone",
            "icon": "star"
        },
        {
            "id": "speech",
            "name": "Speech",
            "icon": "word",
            html: function(entry, player, config){
                if (/[\s\.\,\!\?]/.test(entry.properties.words))
                    return player.name + ' said: <blockquote>' + utils.strings.escapeHtml(entry.properties.words) + '</blockquote>';
                else
                    return player.name + ' said <span class="item-value">&quot;' + utils.strings.escapeHtml(entry.properties.words) + '&quot;</span> for the first time!';
            }
        },
        {
            "id": "teeth",
            "name": "Tooth",
            "icon": "tooth",
            color: "rgb(165, 98, 199)",
            html: function(entry, player, config){
                return player.name + "'s <span class='item-measure'>" + config.entries.teeth.index[entry.properties.tooth].name.toLowerCase() + "</span> has come out";
            }
        }
    ];

    var entryTypesIndex = {};
    entryTypes.forEach(function(entryType){
        entryTypesIndex[entryType.id] = entryType;
    });

    return {
        get typesArray(){
            return entryTypes;
        },
        get types(){
            return entryTypesIndex;
        },
        getEntryDateText: function(date, birthDate){
            return date.toLocaleDateString() + " | " + utils.dates.getAge(date, birthDate);
        },
        /**
         * Checks whether a given entry type is valid - meaning, exists in the entry types array.
         * @param entryType
         * @returns {boolean}
         */
        isValidEntryType: function(entryType){
            return !!~entryTypes.indexOf(entryType);
        }
    }
}]);