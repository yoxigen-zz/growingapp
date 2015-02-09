define([
    "angular",
    "modules/insights/insights",
    "modules/dialogs/dialogs", "modules/dialogs/dialog_directives/dialog", "modules/dialogs/dialog_directives/slide_dialog",
    "directives/charts/line_chart",
    "insights/vaccines/vaccines",
    "classes/file_data",
    "modules/entries/entries_module",
    "services/users",
    "services/files",
    "components/angular/angular-touch.min",
    "components/angular/angular-route.min",
    "services/dbconfig",
    "entries/teeth/directive/teeth.directive",
    "directives/dropdown/dropdown",
    "directives/on-scroll-to-bottom",
    "directives/toggle-display",
    "services/messages",
    "services/localization",
    "services/utils"
], function(angular){

    return angular.module("GrowingApp", [
        "ngRoute", "ngTouch",
        "Dropdown",
        "DataObject",
        "FileData",
        "DBConfig",
        "Config",
        "Entries",
        "EntryType",
        "Vaccines",
        "Insights",
        "OnScrollToBottom",
        "ToggleDisplay", "EventBus", "Utils", "Storage", "Users", "Charts", "Teeth", "Messages", "Dialogs", "Localization", "Files"])
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
});



