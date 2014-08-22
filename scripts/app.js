app = angular.module("Diary", ["ngTouch", "ToggleDisplay", "EventBus", "Utils", "pasvaz.bindonce", "xc.indexedDB", "SelfClick"])
    .config(function ($indexedDBProvider, config) {

        $indexedDBProvider
            .connection('diaryDB')
            .upgradeDatabase(8, function(event, db, tx){
                if (event.newVersion > event.oldVersion) {
                    Object.keys(config.objectStores).forEach(function(objectStoreName){
                        if (db.objectStoreNames.contains(objectStoreName)) {
                            try {
                            db.deleteObjectStore(objectStoreName);
                            }
                            catch(e){
                                alert("Can't delete store '" + config.objectStores.entries + "'");
                            }
                        }
                    });

                    try {
                        var objStore = db.createObjectStore(config.objectStores.entries, { keyPath: "timestamp" });
                        objStore.createIndex('type_idx', ['playerId', 'type', 'date'], {unique: false});
                        objStore.createIndex('date_idx', ['playerId', 'date'], {unique: false});
                        objStore.createIndex('timestamp_idx', 'timestamp', {unique: true});
                    }
                    catch(error){
                        alert("can't create store: " + JSON.stringify(error))
                    }

                    try {
                        var objStore = db.createObjectStore(config.objectStores.players, { keyPath: "id", autoIncrement: true });
                        objStore.createIndex('name_idx', ['name'], {unique: true});
                    }
                    catch(error){
                        alert("can't create store: " + JSON.stringify(error))
                    }
                }
            });
    });