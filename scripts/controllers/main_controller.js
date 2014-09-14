app.controller("MainController", ["$scope", "$route", "Player", "phonegap", "eventBus", function($scope, $route, Player, phonegap, eventBus){
    $scope.setCurrentPlayer = function(player){
        if ($scope.player === player)
            return;

        if (!player)
            player = $scope.players.length ? $scope.players[0] : null;

        $scope.player = player;

        if (player && player.id) {
            localStorage.player = String(player.id);
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
                    if ($scope.players[i].id === storagePlayerId) {
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
        { text: "Insights", href: "#/insights", icon: "images/icons/word.svg" },
        { text: "Settings", href: "#/settings", icon: "images/icons/settings.svg" },
        { text: "Share", href: "#/share", icon: "images/icons/share.svg" },
        { text: "Report bug / Send feedback", href: "#/", icon: "images/icons/mail.svg" },
        //{ text: "Sign out", icon: "images/icons/sign_out.svg" },
        { text: "Close app", icon: "images/icons/sign_out.svg", onClick: function(e){
            if (confirm("Are you sure you want to close the app?"))
                navigator.app.exitApp();
        } }
    ];

    $scope.config = {
        localization: {
            height: {
                all: ["cm", "inches"],
                selected: "cm"
            },
            weight: {
                all: ["kg", "lb"],
                selected: "kg"
            }
        }
    };

    $scope.toggleNewEntriesSelection = function(state){
        $scope.showNewEntriesSelection = state === true || state === false ? state : !$scope.showNewEntriesSelection;
    };

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
                    if (menuPlayer.id === player.id) {
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
                if ($scope.players[i].id === $scope.editedPlayer.id){
                    $scope.players.splice(i, 1);
                    setPlayersSelection($scope.players);
                    $scope.toggleEditPlayer(false);

                    if ($scope.player && $scope.editedPlayer.id === $scope.player.id)
                        $scope.setCurrentPlayer($scope.players.length ? $scope.players[0] : null);

                    $scope.editedPlayer = null;
                    break;
                }
            }
        });
    };

    function setPlayersSelection(players){
        $scope.playersSelection = players.concat([{ name: "+ Add New Child" }]);
        if (!players.length)
            $scope.addNewPlayer();
    }

    $scope.addNewPlayer = function(){
        $scope.editedPlayer = new Player();
        $scope.editedPlayer.properties.gender = "f";
        $scope.editedPlayer.properties.birthday = new Date();
        $scope.toggleEditPlayer(true);
    };
}]);