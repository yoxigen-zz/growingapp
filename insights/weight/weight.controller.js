'use strict';

app.controller("WeightInsightController", ["$scope", "Entry", "utils", "eventBus", function($scope, Entry, utils, eventBus){
    eventBus.subscribe("playerSelect", setData);

    $scope.$on("$destroy", function(){
        eventBus.unsubscribe("playerSelect", setData);
    });

    $scope.chartSettings = {
        dataSeries: "player.id",
        x: "date",
        y: "properties.weight",
        minYValue: 1.8,
        interpolate: "cardinal",
        "axes": {
            "x": {
                "type": "time",
                renderGrid: false
            },
            "y": {
                tickFormat: "d",
                unit: "kg"
            }
        },
        "scales": {
            "x": {
                "type": "time"
            },
            "y": {}
        }
    };

    function setData() {
        if (!$scope.player || !$scope.player.id){
            $scope.weightData = [];
            return;
        }

        Entry.getEntries({ playerId: $scope.player.id, type: "weight" }).then(function (data) {
            $scope.weightData = data;
            setStats(data);
        }).catch(function(error){
            console.error("Can't get entries for weight chart: ", error);
        });
    }

    function setStats(data){
        var stats = [],
            weights = [];

        if (!data || !data.length){
            $scope.stats = null;
            return;
        }

        data.forEach(function(item){
            weights.push(item.properties.weight);
        });

        stats.push({
            color: "#00acd7",
            title: "Average gain per month",
            value: ((Math.max.apply(null, weights) - Math.min.apply(null, weights)) / utils.dates.millisecondsToMonths(data[data.length - 1].date - data[0].date)).toFixed(2) + "kg"
        });

        $scope.stats = stats;
    }

    setData();
}]);