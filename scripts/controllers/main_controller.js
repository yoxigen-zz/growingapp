define(["angular", "services/eventbus"], function(angular){
    angular.module("GrowingApp").controller("MainController", MainController);

    MainController.$inject = [
        "$scope", "$route",
        "localization", "eventBus", "users",
        "cloud", "config", "utils", "$timeout",
        "navigation", "messages", "players",
        "insights", "dialogs", "entriesModel", "entries", "db", "phonegap"
    ];

    function MainController($scope, $route, localization, eventBus, users, cloud, config, utils, $timeout, navigation, messages, players, insights, dialogs, entriesModel, entries, db, phonegap){
        var currentMenuItem,
            spinnerTimeout;

        $scope.config = config;
        $scope.dialogs = dialogs;

        $scope.players = players;

        $scope.offline = !window.navigator.onLine;
        $scope.toggleMenu = toggleMenu;
        $scope.navigation = navigation;
        $scope.openLogin = openLogin;
        $scope.openSignUp = openSignUp;
        $scope.declineSyncOffer = declineSyncOffer;
        $scope.openSettings = openSettings;
        $scope.settingsSubmitAction = { icon: "ok-blue", onSubmit: saveSettings, text: "Save" };
        $scope.signInActions = [
            { text: "New user?", onClick: openSignUp }
        ];
        $scope.settings = config.getCurrentLocalization();
        $scope.insights = insights;

        $scope.entries = entriesModel;
        $scope.localizationUnits = localization.units;
        $scope.entryTypes = entries.typesArray;
        $scope.setEntriesType = setEntriesType;

        $scope.signInSubmitAction = { text: "Sign In", onSubmit: function(){ eventBus.triggerEvent("doLogin") } };
        $scope.appVersion = phonegap.app.version;

        $scope.syncOfferActions = [
            { text: "Don't backup", onClick: declineSyncOffer },
            { text: "Backup now", onClick: openSignUp }
        ];

        $scope.$on("$routeChangeSuccess", onRouteChange);

        eventBus.subscribe("showLogin", openLogin);
        eventBus.subscribe("showSettings", openSettings);
        eventBus.subscribe("login", onLogin);
        eventBus.subscribe("loadingStart", onLoadingStart);
        eventBus.subscribe("loadingEnd", onLoadingEnd);
        eventBus.subscribe("logout", onLogout);
        eventBus.subscribe("settingsChange", onSettingsChange);

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

        // Returning here just to make sure that after this there are only function definitions, to organize code:
        return init();


        function setCurrentMenuItem(){
            var hash = window.location.hash;
            if (currentMenuItem)
                currentMenuItem.selected = false;

            for(var i= 0, item; item = navigation.mainMenuItems[i]; i++){
                if (item.href === hash){
                    currentMenuItem = item;
                    item.selected = true;
                    return;
                }
            }
        }

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

        function openLogin(){
            $scope.showLogin = true;
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

        function openSignUp(){
            dialogs.openDialog("signUp", true);
        }

        function declineSyncOffer(){
            dialogs.syncOffer.close();
            config.sync.declineSyncOffer();
        }


        function onLogin(e){
            dialogs.closeAll();

            $scope.showFirstTimeSelection = false;

            var signoutItem = getMenuItemById("signOut");

            signoutItem.hide = false;
            signoutItem.text = "Sign out " + e.user.attributes.username;

            $scope.currentUser = e.user;
            $scope.settings = config.getCurrentLocalization();
        }

        function onLogout(){
            var signoutItem = getMenuItemById("signOut");
            signoutItem.hide = true;

            $scope.currentUser = null;
            players.clear();
            db.clearDb();

            config.sync.clearLastSyncTimestamp();
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
            setCurrentMenuItem();
        }

        function toggleMenu(){
            dialogs.menu.toggle();
        }

        function setFirstTime(){
            $scope.showFirstTimeSelection = true;
            players.addNewPlayer(false);
        }

        function init(){
            var user = users.getCurrentUser();
            if (user)
                eventBus.triggerEvent("login", { user: user });

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