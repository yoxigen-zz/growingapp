app.factory("entries", ["utils", function entriesFactory(utils){
    var entryTypes = [
        {
            "id": "weight",
            "name": "Weight",
            "icon": "weight",
            "html": '{{child.name}} weights <span class="item-measure">{{data.properties.weight}}{{config.localization.weight.selected}}</span>',
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
            "html": '{{child.name}} is <span class="item-measure">{{data.properties.height}}{{config.localization.height.selected}}</span> tall'
        },
        {
            "id": "speech",
            "name": "Speech",
            "icon": "word",
            html: function(entry, child, config){
                var description = "<p class='item-description'>" + utils.strings.escapeHtml(entry.properties.description) + "</p>";
                if (/[\s\.\,\!\?]/.test(entry.properties.words))
                    return child.name + ' said: <blockquote>' + utils.strings.escapeHtml(entry.properties.words) + '</blockquote>' + description;
                else
                    return child.name + ' said <span class="item-value">&quot;' + utils.strings.escapeHtml(entry.properties.words) + '&quot;</span> for the first time!' + description;
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