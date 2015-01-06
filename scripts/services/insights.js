angular.module("Insights", ["Entries"]).factory("insights", ["entries", function(entries){
    var insightsList = [
            { id: "weight", name: "Weight Chart", description: "Age to weight chart, with percentiles", entryType: entries.types.weight, className: "dark" },
            { id: "height", name: "Height Chart", description: "Age to height chart, with percentiles", entryType: entries.types.height, className: "dark" },
            {
                id: "vaccines",
                name: "Vaccines",
                entryType: entries.types.vaccine
            }
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