app.controller("MainController", ["$scope", "$route", "Player", "phonegap", "eventBus", "users", "cloud", "config", "utils", "$timeout", "navigation", "messages",
    function($scope, $route, Player, phonegap, eventBus, users, cloud, config, utils, $timeout, navigation, messages){
    var currentMenuItem;

    $scope.config = config;
    $scope.setCurrentPlayer = setCurrentPlayer;
    $scope.offline = !window.navigator.onLine;
    $scope.hideMenu = hideMenu;
    $scope.toggleMenu = toggleMenu;
    $scope.menuItems = navigation.mainMenuItems;
    $scope.editPlayer = editPlayer;
    $scope.toggleEditPlayer = function(state){ $scope.showEditPlayer = state === true || state === false ? state : !$scope.showEditPlayer; };
    $scope.openLogin = openLogin;
    $scope.openSyncOffer = function(){ $scope.showSyncOffer = true; };
    $scope.onShowDialog = function(e){ eventBus.triggerEvent("popup.open", e); };
    $scope.onHideDialog = function(e){ eventBus.triggerEvent("popup.close", e); };

    // TODO: move these to a new EditPlayerController:
    $scope.savePlayer = savePlayer;
    $scope.removePlayer = removePlayer;


    $scope.$on("$routeChangeSuccess", onRouteChange);

    eventBus.subscribe("showLogin", openLogin);
    eventBus.subscribe("hideMenu", hideMenu);
    eventBus.subscribe("login", onLogin);

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

    function setCurrentMenuItem(){
        var hash = window.location.hash;
        if (currentMenuItem)
            currentMenuItem.selected = false;

        for(var i= 0, item; item = $scope.menuItems[i]; i++){
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

        for(var i= 0, item; item = $scope.menuItems[i]; i++){
            if (item.id === itemId)
                return item;
        }

        return null;
    }


    function openLogin(){
        $scope.showLogin = true;
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
                $scope.showFirstTimeSelection = true;
        }
    }

    function editPlayer(player){
        if (player instanceof Player) {
            $scope.editedPlayer = angular.copy(player);
            $scope.toggleEditPlayer(true);
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
            $scope.toggleEditPlayer(false);
            $scope.editedPlayer = null;
            $scope.setCurrentPlayer(player);

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
                        $scope.toggleEditPlayer(false);

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

    $scope.addNewPlayer = function(){
        $scope.editedPlayer = new Player();
        $scope.toggleEditPlayer(true);
    };

    $scope.openSignUp = function(){
        $scope.showLogin = false;
        $scope.showSyncOffer = false;
        $scope.showSignup = true;
    };

    $scope.openSyncOffer = function(){
        $scope.showSyncOffer = true;
    };

    $scope.declineSyncOffer = function(){
        $scope.showSyncOffer = false;
        config.sync.declineSyncOffer();
    };

    function onLogin(e){
        $scope.showLogin = false;
        $scope.showSignup = false;

        var signoutItem = getMenuItemById("signOut");

        signoutItem.hide = false;
        signoutItem.text = "Sign out " + e.user.attributes.username;

        $scope.currentUser = e.user;
    }

    eventBus.subscribe("logout", function(){
        var signoutItem = getMenuItemById("signOut");
        signoutItem.hide = true;

        $scope.currentUser = null;
    });

    var spinnerTimeout;
    eventBus.subscribe("loadingStart", function(e){
        $timeout.cancel(spinnerTimeout);
        if (!e || !e.isOnLoad) {
            spinnerTimeout = $timeout(function () {
                $scope.showSpinner = true;
            }, 300);
        }
    });

    eventBus.subscribe("loadingEnd", function(e){
        $scope.showSpinner = false;
        $timeout.cancel(spinnerTimeout);

        if (e && e.error)
            console.error(e.error);
    });

    eventBus.subscribe("updatePlayers", function(e){
        var deletedCurrentPlayer;

        e.players.forEach(function(player){
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
    });

    function onRouteChange(){
        $scope.currentPage = $route.current.$$route && $route.current.$$route.currentPage || "diary";
        $scope.hideMenu();
        setCurrentMenuItem();
    }

    function setCurrentPlayer(player){
        if ($scope.player === player)
            return;

        if (!player)
            player = $scope.players.length ? $scope.players[0] : null;

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
                $scope.showFirstTimeSelection = true;
        }

        eventBus.triggerEvent("playerSelect", player);
    }

    function hideMenu(){
        eventBus.triggerEvent("popup.close");
        $scope.showMenu = false;
    }

    function toggleMenu(){
        if ($scope.showMenu)
            hideMenu();
        else {
            eventBus.triggerEvent("popup.open", { closeDialog: function(){ $scope.showMenu = false; } });
            $scope.showMenu = true;
        }
    }

    function init(){
        var user = users.getCurrentUser();
        if (user)
            eventBus.triggerEvent("login", { user: user });

        Player.getAll().then(function(players){
            $scope.players = players;
            setPlayersSelection(players);

            Player.getCurrentPlayer().then(function(currentPlayer){
                if (currentPlayer)
                    $scope.setCurrentPlayer(currentPlayer);
            });

            cloud.sync({ isOnLoad: true });
        });
    }

    init();
}]);