define(["angular", "components/indexeddb", "services/dbconfig"], function(angular){
    "use strict";

    angular.module("DB", ["xc.indexedDB", "DBConfig"]).factory("db", db);

    db.$inject = ["$q", "$indexedDB", "dbConfig"];

    function db($q, $indexedDB, dbConfig){

        return {
            init: init,
            clearDb: clearDb
        };

        function init(){
            var currentDbVersion = dbConfig.version;

            $indexedDB
                .connection(dbConfig.dbName)
                .upgradeDatabase(currentDbVersion, function(event, db, tx){
                    if (event.newVersion > event.oldVersion) {
                        var objectStoreConfig,
                            objectStore;

                        for(var storeId in dbConfig.objectStores){
                            objectStoreConfig = dbConfig.objectStores[storeId];
                            if (objectStoreConfig.version > event.oldVersion) {
                                // If the objectStore exists and should be updated, delete it:
                                if (db.objectStoreNames.contains(objectStoreConfig.name)) {
                                    try {
                                        db.deleteObjectStore(objectStoreConfig.name);
                                    }
                                    catch (e) {
                                        alert("Can't delete store '" + objectStoreConfig.name + "'");
                                    }
                                }

                                // Create the objectStore:
                                try {
                                    objectStore = db.createObjectStore(objectStoreConfig.name, objectStoreConfig.params);
                                    objectStoreConfig.indexes.forEach(function(index){
                                        objectStore.createIndex(index.name, index.fields, index.params);
                                    });
                                }
                                catch (error) {
                                    console.error("Can't create store '" + objectStoreConfig.name + "': ", error);
                                    alert("Can't create store '" + objectStoreConfig.name + "': " + JSON.stringify(error))
                                }
                            }
                        }
                    }
                });
        }

        /**
         * Removes all contents from the DB, but doesn't remove the object stores themselves.
         */
        function clearDb(){
            var promises = [];

            for(var storeId in dbConfig.objectStores){
                promises.push($indexedDB.objectStore(dbConfig.objectStores[storeId].name).clear());
            }

            return $q.all(promises);
        }
    }
});