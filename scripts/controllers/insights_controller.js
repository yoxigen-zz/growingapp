app.controller("InsightsController", ["$scope", "insights", "$timeout", function($scope, insights, $timeout){
    var shiftTimeout;

    $scope.insights = insights.insightsList;
    $scope.setCurrentInsight = setCurrentInsight;
    $scope.backToInsightsList = unshiftPanels;

    if ($scope.currentInsight = insights.currentInsight)
        setCurrentInsightInclude(insights.currentInsight);

    function setCurrentInsight(insight){
        if (!insight) {
            unshiftPanels();
            return;
        }

        setCurrentInsightInclude(insight);
        $scope.currentInsight = insights.currentInsight = insight;
        shiftPanels();
    }

    function setCurrentInsightInclude(insight){
        $scope.currentInsightInclude = "insights/" + insight.id + "/" + insight.id + ".html";
    }

    function shiftPanels(){
        $scope.secondPanelHidden = false;
        $scope.panelShifted = true;
        shiftTimeout = $timeout(function(){
            $scope.firstPanelHidden = true;
        }, 300);
    }

    function unshiftPanels(){
        $scope.firstPanelHidden = false;
        $scope.panelShifted = false;
        shiftTimeout = $timeout(function(){
            $scope.secondPanelHidden = true;
        }, 300);
    }
}]);