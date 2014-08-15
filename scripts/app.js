app = angular.module("Diary", ["Tap", "ToggleDisplay", "EventBus", "Utils", "pasvaz.bindonce", "xc.indexedDB"])
    .config(function ($indexedDBProvider) {
        var ENTRIES_STORE_NAME = "entries";

        $indexedDBProvider
            .connection('diaryDB')
            .upgradeDatabase(2, function(event, db, tx){
                if (event.newVersion > event.oldVersion) {
                    try {
                        if (db.objectStoreNames.contains(ENTRIES_STORE_NAME))
                            db.deleteObjectStore(ENTRIES_STORE_NAME);
                    }
                    catch(e){
                        alert("Can't delete store '" + ENTRIES_STORE_NAME + "'");
                    }

                    try {
                        var objStore = db.createObjectStore(ENTRIES_STORE_NAME, { autoIncrement: true});
                        objStore.createIndex('type_idx', 'type', {unique: false});
                        objStore.createIndex('date_idx', 'date', {unique: false});
                    }
                    catch(error){
                        alert("can't create store: " + JSON.stringify(error))
                    }
                }
            });
    });