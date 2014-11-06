app.controller("InsightsController", ["$scope", "insights", "$timeout", function($scope, insights, $timeout){

    $scope.insights = insights.insightsList;
    $scope.setCurrentInsight = setCurrentInsight;
    $scope.backToInsightsList = function(){ $scope.panelShifted = false; };

    if ($scope.currentInsight = insights.currentInsight)
        setCurrentInsightInclude(insights.currentInsight);

    function setCurrentInsight(insight){
        if (!insight) {
            $scope.panelShifted = false;
            return;
        }

        setCurrentInsightInclude(insight);
        insights.currentInsight = insight;
        $scope.panelShifted = true;
    }

    function setCurrentInsightInclude(insight){
        $scope.currentInsightInclude = "insights/" + insight.id + "/" + insight.id + ".html";
    }
}]);