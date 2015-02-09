define(["angular", "classes/player", "services/config", "modules/entries/entries", "services/utils", "classes/entry"], function(angular){
    angular.module("Vaccines", ["Player", "Config", "Entries", "Utils"]).factory("vaccines", vaccines);

    vaccines.$inject = ["config", "Player", "Entry"];

    function vaccines(config, Player, Entry) {
        return {
            getVaccines: getVaccines
        };

        /**
         * Gets all the vaccines for the current player
         */
        function getVaccines() {
            return Player.getCurrentPlayer().then(function (player) {
                return Entry.getEntries({ type: "vaccine", player: player, reverse: true });
            });
        }
    }
});