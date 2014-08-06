app.factory("entries", function entriesFactory(){
    var entryTypes = [
        { "id": "weight", "name": "Weight", "icon": "share" },
        { "id": "height", "name": "Height", "icon": "settings" },
        { "id": "speech", "name": "Speech", "icon": "word" }
    ];

    return {
        get types(){
            return entryTypes;
        }
    }
});