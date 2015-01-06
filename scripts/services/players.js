angular.module("Players", []).factory("players", function(){
    var currentPlayer;

    return {
        getCurrentPlayer: getCurrentPlayer,
        setCurrentPlayer: setCurrentPlayer
    };

    function getCurrentPlayer(){
        return currentPlayer;
    }

    function setCurrentPlayer(player){
        currentPlayer = player;
    }
});