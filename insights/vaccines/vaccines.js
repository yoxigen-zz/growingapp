define(["angular", "services/players", "modules/entries/entries"], function(angular){
    angular.module("Vaccines", ["Players", "Entries"]).factory("vaccines", vaccines);

    vaccines.$inject = ["players", "Entry"];

    function vaccines(players, Entry) {
        return {
            getVaccines: getVaccines
        };

        /**
         * Gets all the vaccines for the current player
         */
        function getVaccines() {
            return players.getCurrentPlayer().then(function (player) {
                return Entry.getEntries({ type: "vaccine", player: player, reverse: true });
            });
        }
    }
});