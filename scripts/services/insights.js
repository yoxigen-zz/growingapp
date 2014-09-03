app.factory("insights", [function(){
    var insightsList = [
            { id: "weight", name: "Weight Chart" },
            { id: "height", name: "Height Chart" }
        ],
        currentInsight;

    setCurrentInsight();

    function setCurrentInsight(){
        currentInsight = localStorage.currentInsight;
        if (currentInsight) {
            for (var i = 0, insight; insight = insightsList[i]; i++) {
                if (insight.id === currentInsight){
                    currentInsight = insight;
                    return;
                }
            }
        }

        currentInsight = null;
    }

    return {
        get insightsList(){
            return insightsList;
        },
        get currentInsight(){
            return currentInsight;
        },
        set currentInsight(insight){
            currentInsight = insight;
            localStorage.currentInsight = insight.id;
        }
    }
}]);