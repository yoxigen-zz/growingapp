app.controller("InsightsController", ["$scope", "insights", function($scope, insights){
    $scope.insights = insights.insightsList;

    $scope.onInsightChange = function(insight){
        setCurrentInsightInclude(insight);
        insights.currentInsight = insight;
    };

    if ($scope.currentInsight = insights.currentInsight)
        setCurrentInsightInclude(insights.currentInsight);

    function setCurrentInsightInclude(insight){
        $scope.currentInsightInclude = "insights/" + insight.id + "/" + insight.id + ".html";
    }
}]);