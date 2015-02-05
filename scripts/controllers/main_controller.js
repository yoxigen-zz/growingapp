(function(){
    angular.module("GrowingApp").controller("MainController", MainController);

    MainController.$inject = [
        "$scope", "$route", "Player",
        "localization", "eventBus", "users",
        "cloud", "config", "utils", "$timeout",
        "navigation", "messages", "players",
        "insights", "dialogs", "entriesModel", "entries"
    ];

    function MainController($scope, $route, Player, localization, eventBus, users, cloud, config, utils, $timeout, navigation, messages, players, insights, dialogs, entriesModel, entries){
        var currentMenuItem,
            spinnerTimeout;

        $scope.config = config;
        $scope.dialogs = dialogs;

        $scope.playersService = players;
        $scope.setCurrentPlayer = setCurrentPlayer;
        $scope.saveEditedPlayer = saveEditedPlayer;

        $scope.offline = !window.navigator.onLine;
        $scope.toggleMenu = toggleMenu;
        $scope.navigation = navigation;
        $scope.editPlayer = editPlayer;
        $scope.openLogin = openLogin;
        $scope.addNewPlayer = addNewPlayer;
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

        $scope.syncOfferActions = [
            { text: "Don't backup", onClick: declineSyncOffer },
            { text: "Backup now", onClick: openSignUp }
        ];


        // TODO: move these to a new EditPlayerController:
        $scope.savePlayer = savePlayer;
        $scope.removePlayer = removePlayer;


        $scope.$on("$routeChangeSuccess", onRouteChange);

        eventBus.subscribe("showLogin", openLogin);
        eventBus.subscribe("showSettings", openSettings);
        eventBus.subscribe("login", onLogin);
        eventBus.subscribe("loadingStart", onLoadingStart);
        eventBus.subscribe("loadingEnd", onLoadingEnd);
        eventBus.subscribe("logout", onLogout);
        eventBus.subscribe("updateObjects", onUpdateObjects);
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

        function setFirstPlayer(){
            $scope.setCurrentPlayer($scope.players && $scope.players.length ? $scope.players[0] : null);
        }

        function setPlayersSelection(players){
            $scope.playersSelection = players.concat([{ name: "+ Add New Child" }]);
            if (!players.length) {
                if (config.sync.lastSyncTimestamp)
                    $scope.addNewPlayer();
                else
                    setFirstTime();
            }
        }

        function setEditPlayerActions(isNewPlayer){
            var actions = [
                { icon: "ok", title: "Save child", onClick: savePlayer }
            ];

            if(!isNewPlayer)
                actions.splice(0, 0, { icon: "trash", title: "Delete child", onClick: removePlayer });

            $scope.editedPlayerActions = actions;
        }

        function editPlayer(player){
            if (player instanceof Player) {
                $scope.editPlayerActions = setEditPlayerActions();
                $scope.editedPlayer = angular.copy(player);
                dialogs.editPlayer.open();
            }
            else{
                console.error("Can't edit player - expecting a Player object, got: ", player);
            }
        }

        function savePlayer(){
            if (!$scope.editedPlayer.name){
                return;
            }

            $scope.editedPlayer.save().then(function(player){
                dialogs.editPlayer.close();
                $scope.editedPlayer = null;

                if (player.isNew){
                    $scope.players.push(player);
                    $scope.players.sort(function(a,b){
                        return a.name < b.name ? 1 : -1;
                    });
                }
                else{
                    for(var i= 0, menuPlayer; menuPlayer = $scope.players[i]; i++){
                        if (menuPlayer.playerId === player.playerId) {
                            $scope.players[i] = player;
                            break;
                        }
                    }
                }

                setCurrentPlayer(player);

                setPlayersSelection($scope.players);
                eventBus.triggerEvent("editPlayer", player);
            }, function(error){
                messages.error("Error saving: " + error);
            });
        }

        function removePlayer(){
            messages.confirm("Are you sure you wish to remove this child from the list?").then(function(confirmed){
                if (!confirmed)
                    return;

                $scope.editedPlayer.remove().then(function(){
                    for(var i=0; i < $scope.players.length; i++){
                        if ($scope.players[i].playerId === $scope.editedPlayer.playerId){
                            $scope.players.splice(i, 1);
                            setPlayersSelection($scope.players);
                            dialogs.editPlayer.close();

                            if ($scope.player && $scope.editedPlayer.playerId === $scope.player.playerId)
                                setFirstPlayer();

                            eventBus.triggerEvent("deletePlayer", $scope.editedPlayer);

                            $scope.editedPlayer = null;
                            break;
                        }
                    }
                });
            });
        }

        function addNewPlayer(){
            setEditPlayerActions(true);
            $scope.editedPlayer = new Player();
            dialogs.editPlayer.open();
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

        function onUpdateObjects(e){
            if (e.type === "Player")
                onUpdatePlayers(e.objects);
        }

        function onUpdatePlayers(_players){
            var deletedCurrentPlayer;

            _players.forEach(function(player){
                if (player.isNew){
                    if (!player.deleted)
                        $scope.players.push(player);
                }
                else {
                    var existingPlayer = utils.arrays.find($scope.players, function (p) {
                            return p.playerId === player.playerId;
                        }),
                        existingPlayerIndex;

                    if (existingPlayer) {
                        existingPlayerIndex = $scope.players.indexOf(existingPlayer);
                        if (player.deleted)
                            $scope.players.splice(existingPlayerIndex, 1);
                        else {
                            if (!$scope.players)
                                $scope.players = [];

                            $scope.players[existingPlayerIndex] = player;
                        }
                    }

                    if ($scope.player && player.playerId === $scope.player.playerId) {
                        if (player.deleted)
                            deletedCurrentPlayer = true;
                        else
                            $scope.player = player;
                    }
                }
            });

            if ((!$scope.player && $scope.players.length)|| deletedCurrentPlayer)
                setFirstPlayer();
        }

        function onRouteChange(){
            $scope.currentPage = $route.current.$$route && $route.current.$$route.currentPage || "diary";
            dialogs.menu.close();
            setCurrentMenuItem();
        }

        function setCurrentPlayer(player){
            if (player === $scope.player)
                return;

            if (!player)
                player = $scope.players.length ? $scope.players[0] : null;
            else
                player = utils.arrays.find($scope.players, function(_player){
                     return _player.playerId === player.playerId;
                });

            $scope.player = player;

            if (player && player.playerId) {
                config.players.setCurrentPlayerId(player.playerId);
                $scope.showFirstTimeSelection = false;
            }
            else {
                config.players.removeCurrentPlayerId();
                if (config.sync.lastSyncTimestamp)
                    $scope.addNewPlayer();
                else
                    setFirstTime();
            }

            players.setCurrentPlayer(player);
            eventBus.triggerEvent("playerSelect", player);
        }

        function saveEditedPlayer(){
            // TODO: improve this, remove the editedPlayer from scope
            $scope.editedPlayer = players.editedPlayer;
            savePlayer();
        }

        function toggleMenu(){
            dialogs.menu.toggle();
        }

        function setFirstTime(){
            $scope.showFirstTimeSelection = true;
            players.editPlayer(new Player());
        }

        function init(){
            var user = users.getCurrentUser();
            if (user)
                eventBus.triggerEvent("login", { user: user });

            Player.getAll().then(function(allPlayers){
                $scope.players = allPlayers;
                setPlayersSelection(allPlayers);

                Player.getCurrentPlayer().then(function(currentPlayer){
                    if (currentPlayer) {
                        $scope.setCurrentPlayer(currentPlayer);
                        players.setCurrentPlayer(currentPlayer);
                    }
                });

                cloud.sync({ isOnLoad: true });
                $scope.appLoaded = true;
                $timeout(function(){
                    $scope.splashscreenKill = true;
                }, 450);
            });
        }
    }
})();