app.factory("entries", function entriesFactory(){
    var entryTypes = [
        {
            "id": "weight",
            "name": "Weight",
            "icon": "share",
            "html": 'Lynn weights <span class="item-measure">{{data.properties.weight}}{{config.localization.weight.selected}}</span>'
        },
        { "id": "height", "name": "Height", "icon": "settings" },
        { "id": "speech", "name": "Speech", "icon": "word" }
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
        }
    }
});