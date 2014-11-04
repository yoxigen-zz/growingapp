app.controller("InsightsController", ["$scope", "insights", "$timeout", function($scope, insights, $timeout){

    $scope.insights = insights.insightsList;
    $scope.onInsightChange = onInsightChange;

    if ($scope.currentInsight = insights.currentInsight)
        setCurrentInsightInclude(insights.currentInsight);

    function onInsightChange(insight){
        if (!insight)
            return;

        setCurrentInsightInclude(insight);
        insights.currentInsight = insight;
    }

    function setCurrentInsightInclude(insight){
        $scope.currentInsightInclude = "insights/" + insight.id + "/" + insight.id + ".html";
    }
}]);