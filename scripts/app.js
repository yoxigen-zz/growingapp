app = angular.module("GrowingApp", ["ngRoute", "ToggleDisplay", "EventBus", "Utils", "xc.indexedDB", "Charts", "Phonegap", "Parse", "Storage", "Users", "Popup", "Teeth"])
    .config(["$routeProvider", "$locationProvider", "$indexedDBProvider", "dbConfig", function ($routeProvider, $locationProvider, $indexedDBProvider, dbConfig) {
        $indexedDBProvider
            .connection('diaryDB')
            .upgradeDatabase(14, function(event, db, tx){
                if (event.newVersion > event.oldVersion) {
                    Object.keys(dbConfig.objectStores).forEach(function(objectStoreName){
                        if (db.objectStoreNames.contains(objectStoreName)) {
                            try {
                            db.deleteObjectStore(objectStoreName);
                            }
                            catch(e){
                                alert("Can't delete store '" + dbConfig.objectStores.entries + "'");
                            }
                        }
                    });

                    var objStore;
                    // Create the entries object store:
                    try {
                        objStore = db.createObjectStore(dbConfig.objectStores.entries, { keyPath: "timestamp" });
                        objStore.createIndex('type_idx', ['playerId', 'type', 'date'], {unique: false});
                        objStore.createIndex('date_idx', ['playerId', 'date'], {unique: false});
                        objStore.createIndex('age_idx', ['age'], {unique: false});
                        objStore.createIndex('timestamp_idx', 'timestamp', {unique: true});
                        objStore.createIndex('unsync_idx', 'unsynced', {unique: false});
                    }
                    catch(error){
                        alert("can't create store: " + JSON.stringify(error))
                    }

                    // Create the players object store:
                    try {
                        objStore = db.createObjectStore(dbConfig.objectStores.players, { keyPath: "playerId", autoIncrement: true });
                        objStore.createIndex('name_idx', ['name'], {unique: true});
                        objStore.createIndex('gender_idx', ['gender'], {unique: false});
                        objStore.createIndex('birthday_idx', ['birthday'], {unique: false});
                        objStore.createIndex('unsync_idx', 'unsynced', {unique: false});
                    }
                    catch(error){
                        alert("can't create store: " + JSON.stringify(error))
                    }
                }
            });

        $routeProvider
            .when("/insights", {
                templateUrl: "views/insights.html",
                controller: "InsightsController",
                currentPage: "insights"
            })
            .when("/insights/:insightId", {
                templateUrl: "views/insights.html",
                controller: "InsightsController",
                currentPage: "insights"
            })
            .when("/", {
                templateUrl: "views/diary.html",
                controller: "EntriesListController",
                currentPage: "diary"
            });

        $locationProvider.html5Mode(false);
    }])
    .run(["$rootScope", function($rootScope) {
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

        var parseConfig = {
                appId: "5WepL2v5DjXU0RgKukUSlW3BeAuEOGqDOSgJtKeE",
                javascriptKey:"Pk4mymaX6wXccyywaQeMeuvvJLWeyqRpYLpzWdoX"
            };

        Parse.initialize(parseConfig.appId, parseConfig.javascriptKey);
    }]);




