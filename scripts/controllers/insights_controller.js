app.controller("InsightsController", ["$scope", "$location", function($scope, $location){
    $scope.insights = [
        { id: "weight", name: "Weight Chart" },
        { id: "height", name: "Height Chart" }
    ];

    $scope.onInsightChange = function(insight){
        $scope.currentInsightInclude = "insights/" + insight.id + "/" + insight.id + ".html";
    };
}]);