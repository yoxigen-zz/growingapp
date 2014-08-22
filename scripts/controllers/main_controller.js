app.controller("MainController", ["$scope", "Player", function($scope, Player){
    /*
    $scope.player = {
        name: "Lynn",
        pronoun: "she",
        birthday: new Date(2013, 3, 18, 0, 0, 0),
        id: 1,
        gender: "f"
    };
    */
    $scope.setCurrentPlayer = function(player){
        $scope.player = player;
    };

    Player.getAll().then(function(players){
        $scope.players = players;
        setPlayersSelection(players);
    });

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

    $scope.toggleEditPlayer = function(state){
        $scope.showEditPlayer = state === true || state === false ? state : !$scope.showEditPlayer;
    };

    $scope.savePlayer = function(){
        $scope.editedPlayer.save().then(function(player){
            $scope.player = player;
            $scope.toggleEditPlayer(false);
            $scope.editedPlayer = null;

            if (player.isNewPlayer){
                $scope.players.push(player);
                $scope.players.sort(function(a,b){
                    return a.name < b.name ? 1 : -1;
                });
            }

            setPlayersSelection($scope.players);
        });
    };

    function setPlayersSelection(players){
        $scope.playersSelection = players.concat([{ name: "+ Add New Child" }]);
        if (!players.length)
            addNewPlayer();
    }

    function addNewPlayer(){
        $scope.editedPlayer = new Player();
        $scope.editedPlayer.properties.gender = "f";
        $scope.editedPlayer.properties.birthday = new Date();
        $scope.toggleEditPlayer(true);
    }
}]);