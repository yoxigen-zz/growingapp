define(["app"], function(app) {
    "use strict";

    app.controller("TeethController", teethController);

    teethController.$inject = ["$scope", "teeth", "eventBus", "$timeout", "players"];

    function teethController($scope, teeth, eventBus, $timeout, players) {
        eventBus.subscribe("saveEntry", function(entry){
            if (entry.type.id === "teeth") {
                $timeout(setAddedTeeth, 1000);
            }
        });

        function setAddedTeeth() {
            teeth.getAllAddedTeeth(players.currentPlayer.playerId).then(function (addedTeeth) {
                $scope.addedTeeth = addedTeeth;
            });
        }

        setAddedTeeth();
    }
});