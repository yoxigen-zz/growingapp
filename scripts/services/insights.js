angular.module("Insights", ["Entries", "Dialogs"]).factory("insights", ["entries", "Insight", "dialogs", "entriesModel", function(entries, Insight, dialogs, entriesModel){
    var insightsList = [
            { id: "weight", name: "Weight Chart", description: "Age to weight chart, with percentiles", entryType: entries.types.weight, className: "dark" },
            { id: "height", name: "Height Chart", description: "Age to height chart, with percentiles", entryType: entries.types.height, className: "dark" },
            {
                id: "vaccines",
                name: "Vaccines",
                entryType: entries.types.vaccine
            }
        ],
        currentInsight,
        insights,
        insightsIndex = {};

    insights = insightsList.map(function(insightConfig){
        var insight = new Insight(insightConfig);
        insightsIndex[insight.id] = insight;
        return insight;
    });

    insightsList = null;

    dialogs.currentInsight.actions[0].onClick = function(){
        entriesModel.newEntry(currentInsight.entryType);
    };

    return {
        get insightsList(){
            return insights;
        },
        get currentInsight(){
            return currentInsight;
        },
        set currentInsight(value){
            this.setCurrentInsight(value);
        },
        setCurrentInsight: function(insight){
            if (!insight)
                currentInsight = null;
            else if (typeof(insight) === "string"){
                var foundInsight = insightsIndex[insight];
                if (!foundInsight)
                    throw new Error("Unknown insight ID, '" + insight + ".");

                currentInsight = foundInsight;
            }
            else if (insight instanceof Insight)
                currentInsight = insight;
            else
                throw new TypeError("Invalid insight, expected either an insightId or an Insight object.");

        },
        closeInsight: function(){
            currentInsight = null;
        }
    }
}]);