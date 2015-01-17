angular.module("Vaccines", ["Player", "Config", "Entries"]).factory("vaccines", ["config", "Player", "Entry", function(config, Player, Entry){
    return {
        getVaccines: getVaccines
    };

    /**
     * Gets all the vaccines for the current player
     */
    function getVaccines(){
        return Player.getCurrentPlayer().then(function(player){
            return Entry.getEntries({ type: "vaccine", player: player, reverse: true }).then(function(vaccineEntries){
                vaccineEntries.forEach(function(entry){
                    entry.vaccine = config.entries.vaccines.index[entry.properties.vaccineId];
                });

                return vaccineEntries;
            });
        });
    }
}]);