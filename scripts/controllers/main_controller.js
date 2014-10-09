app.controller("MainController", ["$scope", "$route", "Player", "phonegap", "eventBus", "users", "cloud", "config", "utils", function($scope, $route, Player, phonegap, eventBus, users, cloud, config, utils){
    $scope.config = config;

    $scope.setCurrentPlayer = function(player){
        if ($scope.player === player)
            return;

        if (!player)
            player = $scope.players.length ? $scope.players[0] : null;

        $scope.player = player;

        if (player && player.playerId) {
            localStorage.player = String(player.playerId);
        }
        else {
            localStorage.removeItem("player");
            $scope.addNewPlayer();
        }

        eventBus.triggerEvent("playerSelect", player);
    };

    $scope.$on("$routeChangeSuccess", function(){
        $scope.currentPage = $route.current.$$route && $route.current.$$route.currentPage || "diary";
        $scope.hideMenu();
        setCurrentMenuItem();
    });

    Player.getAll().then(function(players){
        $scope.players = players;
        setPlayersSelection(players);

        if ($scope.players.length) {
            var storagePlayerId = localStorage.player;
            if (storagePlayerId) {
                storagePlayerId = parseInt(storagePlayerId, 10);
                for (var i = 0; i < $scope.players.length; i++) {
                    if ($scope.players[i].playerId === storagePlayerId) {
                        $scope.setCurrentPlayer($scope.players[i]);
                        break;
                    }
                }
            }
            else
                $scope.setCurrentPlayer($scope.players[0]);
        }
    });

    $scope.hideMenu = function(){
        $scope.showMenu = false;
    };

    var currentMenuItem;
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

    $scope.menuItems = [
        { text: "Diary", href: "#/", icon: "images/icons/weight.svg" },
        { text: "Insights", href: "#/insights", icon: "images/icons/charts.svg" },
        //{ text: "Settings", href: "#/settings", icon: "images/icons/settings.svg" },
        //{ text: "Share", href: "#/share", icon: "images/icons/share.svg" },
        //{ text: "Feedback / Bugs", href: "#/", icon: "images/icons/mail.svg" },
        { text: "Sync data with cloud", icon: "images/icons/cloud_sync.svg", onClick: function(e){
            if (users.getCurrentUser())
                cloud.sync();
            else
                $scope.showLogin = true;

            $scope.hideMenu();
        } },
        { id: "signOut", hide: true, text: "Sign out", icon: "images/icons/sign_out.svg", onClick: function(e){
            $scope.hideMenu();
            users.logout();
            eventBus.triggerEvent("logout");
        } },
        { id: "closeApp", text: "Close app", icon: "images/icons/close-black.svg", onClick: function(e){
            if (confirm("Are you sure you want to close the app?"))
                navigator.app.exitApp();
        } }
    ];

    function getMenuItemById(itemId){
        if (!itemId)
            return null;

        for(var i= 0, item; item = $scope.menuItems[i]; i++){
            if (item.id === itemId)
                return item;
        }

        return null;
    }

    $scope.editPlayer = function(player){
        if (player instanceof Player) {
            $scope.editedPlayer = angular.copy(player);
            $scope.toggleEditPlayer(true);
        }
        else{
            console.error("Can't edit player - expecting a Player object, got: ", player);
        }
    };

    $scope.closeEditPlayer = function(){
        $scope.showEditPlayer = false;
    };

    $scope.toggleEditPlayer = function(state){
        $scope.showEditPlayer = state === true || state === false ? state : !$scope.showEditPlayer;
    };

    $scope.savePlayer = function(){
        $scope.editedPlayer.save().then(function(player){
            $scope.toggleEditPlayer(false);
            $scope.editedPlayer = null;
            $scope.setCurrentPlayer(player);

            if (player.isNewPlayer){
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
        });
    };

    $scope.takePlayerPicture = function(){
        phonegap.images.takePhoto({
            allowEdit : true,
            targetWidth: 400,
            targetHeight: 400,
            saveToPhotoAlbum: false
        }).then(function(fileUrl){
            $scope.editedPlayer.image = fileUrl;
        }, function(error){
            alert(error);
            console.error("Error taking picture: ", error);
        });
    };

    $scope.browsePlayerPicture = function(){
        phonegap.images.browsePhotos({
            allowEdit : true,
            targetWidth: 400,
            targetHeight: 400,
            saveToPhotoAlbum: false
        }).then(function(fileUrl){
            $scope.editedPlayer.image = fileUrl;
        }, function(error){
            alert(error);
            console.error("Error taking picture: ", error);
        });
    };

    $scope.removePlayer = function(){
        if (!confirm("Are you sure you wish to remove this child from the list?"))
            return;

        $scope.editedPlayer.remove().then(function(){
            for(var i=0; i < $scope.players.length; i++){
                if ($scope.players[i].playerId === $scope.editedPlayer.playerId){
                    $scope.players.splice(i, 1);
                    setPlayersSelection($scope.players);
                    $scope.toggleEditPlayer(false);

                    if ($scope.player && $scope.editedPlayer.playerId === $scope.player.playerId)
                        setFirstPlayer();

                    $scope.editedPlayer = null;
                    break;
                }
            }
        });
    };

    function setFirstPlayer(){
        $scope.setCurrentPlayer($scope.players && $scope.players.length ? $scope.players[0] : null);
    }

    function setPlayersSelection(players){
        $scope.playersSelection = players.concat([{ name: "+ Add New Child" }]);
        if (!players.length)
            $scope.addNewPlayer();
    }

    $scope.addNewPlayer = function(){
        $scope.editedPlayer = new Player();
        $scope.editedPlayer.gender = "f";
        $scope.editedPlayer.birthday = new Date();
        $scope.toggleEditPlayer(true);
    };

    $scope.closeLogin = function(){
        $scope.showLogin = false;
    };

    eventBus.subscribe("login", function(data){
        $scope.closeLogin();
        var signoutItem = getMenuItemById("signOut");

        signoutItem.hide = false;
        signoutItem.text = "Sign out " + data.user.attributes.username;

        $scope.currentUser = data.user;
    });

    eventBus.subscribe("logout", function(){
        var signoutItem = getMenuItemById("signOut");
        signoutItem.hide = true;

        $scope.currentUser = null;
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

    function init(){
        var user = users.getCurrentUser();
        if (user)
            eventBus.triggerEvent("login", { user: user });

        // This inits the players:
        Player.getAll().then(function(){
            cloud.sync();
        });
    }

    init();
}]);