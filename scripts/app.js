app = angular.module("Diary", ["ngRoute", "ngTouch", "ToggleDisplay", "EventBus", "Utils", "pasvaz.bindonce", "xc.indexedDB", "SelfClick", "Charts"])
    .config(["$routeProvider", "$locationProvider", "$indexedDBProvider", "config", function ($routeProvider, $locationProvider, $indexedDBProvider, config) {
        $indexedDBProvider
            .connection('diaryDB')
            .upgradeDatabase(9, function(event, db, tx){
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

                    // Create the entries object store:
                    try {
                        var objStore = db.createObjectStore(config.objectStores.entries, { keyPath: "timestamp" });
                        objStore.createIndex('type_idx', ['playerId', 'type', 'date'], {unique: false});
                        objStore.createIndex('date_idx', ['playerId', 'date'], {unique: false});
                        objStore.createIndex('age_idx', ['age'], {unique: false});
                        objStore.createIndex('timestamp_idx', 'timestamp', {unique: true});
                    }
                    catch(error){
                        alert("can't create store: " + JSON.stringify(error))
                    }

                    // Create the players object store:
                    try {
                        var objStore = db.createObjectStore(config.objectStores.players, { keyPath: "id", autoIncrement: true });
                        objStore.createIndex('name_idx', ['name'], {unique: true});
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
            .otherwise({
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
    }]);




