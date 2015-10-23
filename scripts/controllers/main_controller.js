define(["angular", "app"], function(angular){
    angular.module("GrowingApp").controller("MainController", MainController);

    MainController.$inject = [
        "$scope", "$route",
        "localization", "eventBus", "users",
        "cloud", "config", "$timeout",
        "navigation", "players",
        "insights", "dialogs", "entriesModel", "entries", "db", "phonegap"
    ];

    function MainController($scope, $route, localization, eventBus, users, cloud, config, $timeout, navigation, players, insights, dialogs, entriesModel, entries, db, phonegap){
        var spinnerTimeout;

        $scope.config = config;
        $scope.dialogs = dialogs;

        $scope.players = players;

        $scope.offline = !window.navigator.onLine;
        $scope.navigation = navigation;
        $scope.openSettings = openSettings;
        $scope.settingsSubmitAction = { icon: "ok-blue", onSubmit: saveSettings, text: "Save" };
        $scope.settings = config.getCurrentLocalization();
        $scope.insights = insights;

        $scope.entries = entriesModel;
        $scope.localization = localization;
        $scope.entryTypes = entries.typesArray;
        $scope.setEntriesType = setEntriesType;

        $scope.signInSubmitAction = { text: "Sign In", onSubmit: function(){ eventBus.triggerEvent("doLogin") } };
        $scope.appVersion = phonegap.app.version;

        $scope.$on("$routeChangeSuccess", onRouteChange);

        users.onLogin.subscribe(onLogin);
        users.onLogout.subscribe(onLogout);
        eventBus.subscribe("loadingStart", onLoadingStart);
        eventBus.subscribe("loadingEnd", onLoadingEnd);
        eventBus.subscribe("settingsChange", onSettingsChange);
        eventBus.subscribe("playerSelect", function(){
            if ($scope.showFirstTimeSelection)
                $scope.showFirstTimeSelection = false;
        });

        window.addEventListener("online", function(){
            $scope.$apply(function(){
                $scope.offline = false;
            });
        });

        window.addEventListener("offline", function(){
            $scope.$apply(function(){
                $scope.offline = true;
            });
        });

        return init();

        function getMenuItemById(itemId){
            if (!itemId)
                return null;

            for(var i= 0, item; item = navigation.mainMenuItems[i]; i++){
                if (item.id === itemId)
                    return item;
            }

            return null;
        }

        function setEntriesType(type){
            entriesModel.currentEntriesType = type;
            entriesModel.setEntries();
        }

        function openSettings(){
            $scope.settings = angular.copy(config.getCurrentLocalization());
            dialogs.settings.open();
        }
        function saveSettings(){
            delete $scope.settings.__updateTime__;

            if (config.saveLocalization($scope.settings))
                eventBus.triggerEvent("settingsChange");

            dialogs.settings.close();
        }

        function onNoPlayers(){
            if (config.sync.lastSyncTimestamp)
                players.addNewPlayer();
            else
                setFirstTime();
        }

        function onLogin(e){
            $scope.showFirstTimeSelection = false;

            var signoutItem = getMenuItemById("signOut");

            signoutItem.hide = false;
            signoutItem.text = "Sign out " + e.user.attributes.username;

            $scope.settings = config.getCurrentLocalization();
        }

        function onLogout(){
            var signoutItem = getMenuItemById("signOut");
            signoutItem.hide = true;

            config.sync.clearLastSyncTimestamp();
            setFirstTime();
        }

        function onLoadingStart(e){
            $timeout.cancel(spinnerTimeout);
            if (!e || !e.isOnLoad) {
                spinnerTimeout = $timeout(function () {
                    $scope.showSpinner = true;
                }, 300);
            }
        }
        function onLoadingEnd(e){
            $scope.showSpinner = false;
            $timeout.cancel(spinnerTimeout);

            if (e && e.error)
                console.error(e.error);
        }

        function onSettingsChange(){
            $scope.settings = config.getCurrentLocalization();
        }

        function onRouteChange(){
            $scope.currentPage = $route.current.$$route && $route.current.$$route.currentPage || "diary";
            dialogs.menu.close();
        }

        function setFirstTime(){
            $scope.showFirstTimeSelection = true;
            players.addNewPlayer(false);
        }

        function init(){
            if (users.currentUser)
                onLogin({ user: users.currentUser });

            players.getAll().then(function(allPlayers){
                if (!allPlayers || !allPlayers.length)
                    onNoPlayers();
                else {
                    players.getCurrentPlayer().then(function (currentPlayer) {
                        if (!currentPlayer)
                            onNoPlayers();
                    });
                }

                cloud.sync({ isOnLoad: true });
                $scope.appLoaded = true;
                $timeout(function(){
                    $scope.splashscreenKill = true;
                }, 450);
            });
        }
    }
});