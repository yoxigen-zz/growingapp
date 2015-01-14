app = angular.module("GrowingApp", [
    "ngRoute", "ngTouch",
    "xc.indexedDB",
    "Phonegap", "Parse",
    "app.filters",
    "DataObject",
    "DataObjectCollection",
    "FileData",
    "DBConfig",
    "Config",
    "Players",
    "Entries",
    "EntryType",
    "Vaccines",
    "Insights",
    "OnScrollToBottom",
    "ToggleDisplay", "EventBus", "Utils", "Charts", "Storage", "Users", "Teeth", "Images", "Messages", "Dialogs", "Localization", "Files"])
    .config(["$routeProvider", "$locationProvider", "$indexedDBProvider", "dbConfig", function ($routeProvider, $locationProvider, $indexedDBProvider, dbConfig) {
        var currentDbVersion = 17;

        $indexedDBProvider
            .connection('diaryDB')
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

        $routeProvider
            .when("/insights", {
                templateUrl: "views/insights.html",
                currentPage: "insights"
            })
            .when("/", {
                templateUrl: "views/diary.html",
                controller: "EntriesListController",
                currentPage: "diary"
            });

        $locationProvider.html5Mode(false);
    }])
    .run(["$rootScope", "$timeout", "parse", function($rootScope, $timeout, parse) {
        if (!$rootScope.safeApply) {
            $rootScope.safeApply = function (fn) {
                var phase = $rootScope.$$phase;
                if (phase == '$apply' || phase == '$digest') {
                    if (fn && (typeof(fn) === 'function')) {
                        fn();
                    }
                } else {
                    this.$apply(fn);
                }
            };
        }

        parse.init();
    }]);




