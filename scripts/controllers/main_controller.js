app.controller("MainController", ["$scope", function($scope){
    $scope.child = {
        name: "Lynn",
        pronoun: "she",
        birthday: "2013-04-18"
    };

    $scope.config = {
        localization: {
            length: {
                all: ["cm", "inches"],
                selected: "cm"
            },
            weight: {
                all: ["kg", "lb"],
                selected: "kg"
            }
        }
    };
}]);