app.controller("TeethController", ["$scope", "teeth", "eventBus", "$timeout", function($scope, teeth, eventBus, $timeout){
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
}]);