app = angular.module("Diary", ["ngTouch", "ToggleDisplay", "EventBus", "Utils", "pasvaz.bindonce", "xc.indexedDB", "SelfClick"])
    .config(function ($indexedDBProvider) {
        var ENTRIES_STORE_NAME = "entries";

        $indexedDBProvider
            .connection('diaryDB')
            .upgradeDatabase(3, function(event, db, tx){
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
                        objStore.createIndex('type_idx', 'type', {unique: false});
                        objStore.createIndex('date_idx', 'date', {unique: false});
                        objStore.createIndex('timestamp_idx', 'timestamp', {unique: true});
                        objStore.createIndex('child_idx', 'childId', { unique: false });
                    }
                    catch(error){
                        alert("can't create store: " + JSON.stringify(error))
                    }
                }
            });
    });