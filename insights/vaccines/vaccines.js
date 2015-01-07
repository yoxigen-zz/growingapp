angular.module("Vaccines", ["Players", "Config", "Entries"]).factory("vaccines", ["config", "players", "Entry", function(config, players, Entry){
    return {
        getVaccines: getVaccines
    };

    /**
     * Gets all the vaccines for the current player
     */
    function getVaccines(){
        var player = players.getCurrentPlayer();
        return Entry.getEntries({ type: "vaccine", player: player }).then(function(vaccineEntries){
            vaccineEntries.forEach(function(entry){
                entry.vaccine = config.entries.vaccines.index[entry.properties.vaccineId];
            });

            return vaccineEntries;
        });
    }
}]);