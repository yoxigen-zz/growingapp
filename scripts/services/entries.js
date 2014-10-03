app.factory("entries", ["utils", function entriesFactory(utils){
    var entryTypes = [
        {
            "id": "weight",
            "name": "Weight",
            "icon": "weight",
            "html": '{{player.name}} weights <span class="item-measure">{{data.properties.weight}}{{config.localization.weight.selected}}</span>',
            "properties": [
                {
                    type: "number",
                    name: "weight",
                    isRequired: true,
                    min: 0.1,
                    max: 200
                }
            ]
        },
        {
            "id": "height",
            "name": "Height",
            "icon": "height",
            "html": '{{player.name}} is <span class="item-measure">{{data.properties.height}}{{config.localization.height.selected}}</span> tall'
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

                return text ? player.name + " " + text.toLowerCase() : "Unknown milestone";
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