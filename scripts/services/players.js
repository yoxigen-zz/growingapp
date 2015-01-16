angular.module("Players", []).factory("players", function(){
    var currentPlayer;

    return {
        getCurrentPlayer: getCurrentPlayer,
        getCurrentPlayerId: function(){
            var currentPlayer = getCurrentPlayer();
            return currentPlayer && currentPlayer.playerId;
        },
        setCurrentPlayer: setCurrentPlayer
    };

    function getCurrentPlayer(){
        return currentPlayer;
    }

    function setCurrentPlayer(player){
        currentPlayer = player;
    }
});