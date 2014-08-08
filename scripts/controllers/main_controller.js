app.controller("MainController", ["$scope", function($scope){
    $scope.child = {
        name: "Lynn",
        pronoun: "she",
        birthday: new Date(2013, 3, 18, 0, 0, 0)
    };

    $scope.config = {
        localization: {
            height: {
                all: ["cm", "inches"],
                selected: "cm"
            },
            weight: {
                all: ["kg", "lb"],
                selected: "kg"
            }
        }
    };

    $scope.toggleNewEntriesSelection = function(state){
        $scope.showNewEntriesSelection = state === true || state === false ? state : !$scope.showNewEntriesSelection;
    };
}]);