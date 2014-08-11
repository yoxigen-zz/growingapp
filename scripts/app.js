app = angular.module("Diary", ["Tap", "ToggleDisplay", "EventBus", "Utils", "pasvaz.bindonce", "xc.indexedDB"])
    .config(function ($indexedDBProvider) {
        $indexedDBProvider
            .connection('diaryDB')
            .upgradeDatabase(2, function(event, db, tx){
                if (event.newVersion > event.oldVersion) {
                    db.deleteObjectStore("entries");
                    var objStore = db.createObjectStore('entries', { autoIncrement: true});
                    objStore.createIndex('type_idx', 'type', {unique: false});
                    objStore.createIndex('date_idx', 'date', {unique: false});
                }
            });
    });