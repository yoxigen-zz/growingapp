app.controller("InsightsController", ["$scope", "insights", "$timeout", function($scope, insights, $timeout){
    $scope.insights = insights.insightsList;

    $scope.onInsightChange = function(insight){
        if (!insight)
            return;

        $scope.currentInsight = insight;
        setCurrentInsightInclude(insight);
        insights.currentInsight = insight;
    };

    if ($scope.currentInsight = insights.currentInsight)
        setCurrentInsightInclude(insights.currentInsight);

    function setCurrentInsightInclude(insight){
        $scope.currentInsightInclude = "insights/" + insight.id + "/" + insight.id + ".html";
    }
}]);