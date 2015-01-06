angular.module("Vaccines", ["Players", "Config"]).factory("vaccines", ["config", "players", function(config, players){
    return {
        getVaccines: getVaccines
    };

    /**
     * Gets all the vaccines for the current player
     */
    function getVaccines(){
        var player = players.getCurrentPlayer();
        console.log("PLA: ", player);
    }
}]);