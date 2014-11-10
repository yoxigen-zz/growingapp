app.controller("InsightsController", ["$scope", "insights", "$timeout", function($scope, insights, $timeout){
    var shiftTimeout;

    $scope.insights = insights.insightsList;
    $scope.setCurrentInsight = setCurrentInsight;
    $scope.backToInsightsList = goToInsightsList;
    $scope.onCloseInsight = onCloseInsight;

    function setCurrentInsight(insight){
        setCurrentInsightInclude(insight);
        $scope.currentInsight = insight;
    }

    function goToInsightsList(){
        setCurrentInsight(null);
    }

    function setCurrentInsightInclude(insight){
        $scope.currentInsightInclude = insight ? "insights/" + insight.id + "/" + insight.id + ".html" : null;
    }

    function onCloseInsight(){
        $scope.onHideDialog();
        goToInsightsList();
    }
}]);