define(["app"], function(app) {
    "use strict";

    app.controller("TeethController", teethController);

    teethController.$inject = ["$scope", "teeth", "eventBus", "$timeout"];

    function teethController($scope, teeth, eventBus, $timeout) {
        eventBus.subscribe("saveEntry", function(entry){
            if (entry.type.id === "teeth") {
                $timeout(setAddedTeeth, 1000);
            }
        });

        function setAddedTeeth() {
            teeth.getAllAddedTeeth($scope.player.playerId).then(function (addedTeeth) {
                $scope.addedTeeth = addedTeeth;
            });
        }

        setAddedTeeth();
    }
});