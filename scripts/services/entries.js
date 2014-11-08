app.factory("entries", ["utils", "localization", "config", "$filter", function entriesFactory(utils, localization, config, $filter){
    var entryTypes = [
        {
            "id": "weight",
            "name": "Weight",
            "icon": "weight",
            "html": function(entry, player) {
                var unitFilter = $filter("unit"),
                    htmlArr = [player.name, ' weights <span class="item-measure">'],
                    value = unitFilter(entry.properties.absoluteWeight || entry.properties.weight, "weight");

                htmlArr.push($filter("toFixed")(value, 2));
                htmlArr.push(config.localization.weight.selected);
                htmlArr.push("</span>");
                return htmlArr.join("");
            },
            "properties": [
                {
                    type: "number",
                    name: "weight",
                    isRequired: true,
                    min: 0.1,
                    max: 200
                }
            ],
            "prepareForEdit": function(entry){
                var convertMethod = localization.convertFromUnit;
                entry.properties.weight = parseFloat(convertMethod("weight", entry.properties.absoluteWeight || entry.properties.weight, config.localization.weight.selected).toFixed(2));
            },
            "preSave": function(entry){
                entry.properties.absoluteWeight = localization.convertToUnit("weight", entry.properties.weight, config.localization.weight.selected);
            },
            "localizationDependencies": ["weight"]
        },
        {
            "id": "height",
            "name": "Height",
            "icon": "height",
            "html": '{{player.name}} is <span class="item-measure">{{data.properties.height}}{{config.localization.height.selected}}</span> tall',
            "preSave": function(entry){
                entry.properties.absoluteHeight = localization.convertToUnit("height", entry.properties.height, config.localization.height.selected).toFixed(2);
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
            "id": "note",
            "name": "Note",
            "icon": "note",
            "html": "{{data.properties.text}}",
            allowDescription: false
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
            "name": "Teeth",
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