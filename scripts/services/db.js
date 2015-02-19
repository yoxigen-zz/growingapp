define(["angular", "components/indexeddb", "services/dbconfig", "services/users"], function(angular){
    "use strict";

    angular.module("DB", ["xc.indexedDB", "DBConfig", "Users"]).factory("db", db);

    db.$inject = ["$q", "$indexedDB", "dbConfig", "users"];

    function db($q, $indexedDB, dbConfig, users){

        var api = {
            clearDb: clearDb
        };

        // On logout the whole DB is cleared:
        users.onLogout.subscribe(clearDb);

        return api;
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