app = angular.module("Diary", ["Tap", "ToggleDisplay", "EventBus", "Utils", "pasvaz.bindonce", "xc.indexedDB"])
    .config(function ($indexedDBProvider) {
        $indexedDBProvider
            .connection('diaryDB')
            .upgradeDatabase(2, function(event, db, tx){
                if (event.newVersion > event.oldVersion) {
                    try {
                        db.deleteObjectStore("entries");
                    }
                    catch(e){
                        alert("Can't delete store");
                    }

                    try {
                        var objStore = db.createObjectStore('entries', { autoIncrement: true});
                        objStore.createIndex('type_idx', 'type', {unique: false});
                        objStore.createIndex('date_idx', 'date', {unique: false});
                    }
                    catch(error){
                        alert("can't create store: " + JSON.stringify(error))
                    }
                }
            });
    });