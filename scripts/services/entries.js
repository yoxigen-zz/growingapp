app.factory("entries", ["utils", "localization", "config", "$filter", function entriesFactory(utils, localization, config, $filter){
    var unitFilter = $filter("unit");
    var entryTypes = [
        /*
        {
            "id": "photo",
            "name": "Photo",
            "icon": "photo",
            "html": "<img src='{{data.properties.url}}' />"
        },
        */
        {
            "id": "note",
            "name": "Note",
            "icon": "note",
            "html": "{{data.properties.text}}",
            allowDescription: false
        },
        {
            "id": "weight",
            "name": "Weight",
            "icon": "weight",
            "html": function(entry, player) {
                var htmlArr = [player.name, ' weights <span class="item-measure">'],
                    value = unitFilter(entry.properties.value || entry.properties.weight, "weight");

                htmlArr.push($filter("toFixed")(value, 2));
                htmlArr.push(localization.units.weight[config.localization.weight.selected].display);
                htmlArr.push("</span>");
                return htmlArr.join("");
            },
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
            "html": function(entry, player) {
                var htmlArr = [player.name, ' is <span class="item-measure">'],
                    value = unitFilter(entry.properties.value || entry.properties.height, "height");

                htmlArr.push($filter("toFixed")(value, 2));
                htmlArr.push(localization.units.height[config.localization.height.selected].display);
                htmlArr.push("</span> tall");
                return htmlArr.join("");
            },
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
            "icon": "star",
            "html": function(entry, player, config){
                var type = config.entries.milestone.typesIndex[entry.properties.type],
                    text;

                if (type)
                    text = type.text;
                else
                    text = entry.properties.text;

                return text ? player.name + " " + text.replace(/^\w/g, function(a){ return a.toLowerCase() }) : "Unknown milestone";
            }
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
        }
    }
}]);