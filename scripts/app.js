app = angular.module("Diary", ["ngTouch", "ToggleDisplay", "EventBus", "Utils", "pasvaz.bindonce", "xc.indexedDB", "SelfClick"])
    .config(function ($indexedDBProvider) {
        var ENTRIES_STORE_NAME = "entries";

        $indexedDBProvider
            .connection('diaryDB')
            .upgradeDatabase(7, function(event, db, tx){
                if (event.newVersion > event.oldVersion) {
                    try {
                        if (db.objectStoreNames.contains(ENTRIES_STORE_NAME))
                            db.deleteObjectStore(ENTRIES_STORE_NAME);
                    }
                    catch(e){
                        alert("Can't delete store '" + ENTRIES_STORE_NAME + "'");
                    }

                    try {
                        var objStore = db.createObjectStore(ENTRIES_STORE_NAME, { keyPath: "timestamp" });
                        objStore.createIndex('type_idx', ['playerId', 'type', 'date'], {unique: false});
                        objStore.createIndex('date_idx', ['playerId', 'date'], {unique: false});
                        objStore.createIndex('timestamp_idx', 'timestamp', {unique: true});
                    }
                    catch(error){
                        alert("can't create store: " + JSON.stringify(error))
                    }
                }
            });
    });