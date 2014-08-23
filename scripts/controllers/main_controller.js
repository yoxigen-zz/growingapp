app.controller("MainController", ["$scope", "Player", function($scope, Player){
    $scope.setCurrentPlayer = function(player){
        $scope.currentPlayer = player;
    };

    Player.getAll().then(function(players){
        $scope.players = players;
        setPlayersSelection(players);

        var storagePlayerId = localStorage.player;
        if (storagePlayerId){
            storagePlayerId = parseInt(storagePlayerId, 10);
            for(var i=0; i < $scope.players.length; i++) {
                if ($scope.players[i].id === storagePlayerId) {
                    $scope.currentPlayer = $scope.players[i];
                    break;
                }
            }
        }
    });

    $scope.hideMenu = function(){
        $scope.showMenu = false;
    };

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
            $scope.editedPlayer = player;
            $scope.toggleEditPlayer(true);
        }
        else{
            console.error("Can't edit player - expecting a Player object, got: ", player);
        }
    };

    $scope.toggleEditPlayer = function(state){
        $scope.showEditPlayer = state === true || state === false ? state : !$scope.showEditPlayer;
    };

    $scope.savePlayer = function(){
        $scope.editedPlayer.save().then(function(player){
            $scope.toggleEditPlayer(false);
            $scope.editedPlayer = null;

            if (player.isNewPlayer){
                $scope.player = player;
                $scope.players.push(player);
                $scope.players.sort(function(a,b){
                    return a.name < b.name ? 1 : -1;
                });
                $scope.currentPlayer = player;
            }

            setPlayersSelection($scope.players);
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
                    $scope.editedPlayer = null;
                    break;
                }
            }
        });
    };

    $scope.$watch("currentPlayer", function(value){
        if (!value)
            return;

        if (value.id) {
            $scope.player = value;
            localStorage.player = String(value.id);
        }
        else
            $scope.addNewPlayer();
    });

    function setPlayersSelection(players){
        $scope.playersSelection = players.concat([{ name: "+ Add New Child" }]);
        if (!players.length)
            addNewPlayer();
    }

    $scope.addNewPlayer = function(){
        $scope.editedPlayer = new Player();
        $scope.editedPlayer.properties.gender = "f";
        $scope.editedPlayer.properties.birthday = new Date();
        $scope.toggleEditPlayer(true);
    };
}]);