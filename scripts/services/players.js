angular.module("Players", []).factory("players", function(){
    var currentPlayer;

    var methods = {
        editPlayer: function(player){
            methods.editedPlayer = player;
        },
        getCurrentPlayer: getCurrentPlayer,
        getCurrentPlayerId: function(){
            var currentPlayer = getCurrentPlayer();
            return currentPlayer && currentPlayer.playerId;
        },
        setCurrentPlayer: setCurrentPlayer
    };

    return methods;

    function getCurrentPlayer(){
        return currentPlayer;
    }

    function setCurrentPlayer(player){
        currentPlayer = player;
    }
});