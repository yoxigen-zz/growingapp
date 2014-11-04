'use strict';

app.controller("LineChartInsightController", ["$scope", "Entry", "utils", "eventBus", "config", "statistics", function($scope, Entry, utils, eventBus, config, statistics){
    var insightId = $scope.currentInsight.id;

    eventBus.subscribe("playerSelect", setData);

    $scope.$on("$destroy", function(){ eventBus.unsubscribe("playerSelect", setData); });

    $scope.chartSettings = {
        dataSeries: "player.name",
        x: "age",
        y: "properties." + insightId,
        interpolate: "cardinal",
        "axes": {
            "x": {
                "type": "age",
                "tickFormat": "age",
                renderGrid: false
            },
            "y": {
                tickFormat: "d",
                unit: config.localization[insightId].selected
            }
        },
        "scales": {
            "x": {},
            "y": {}
        }
    };

    setData();


    function setData() {
        if (!$scope.player || !$scope.player.playerId){
            $scope.chartData = [];
            return;
        }

        Entry.getEntries({ playerId: $scope.player.playerId, type: insightId }).then(function (data) {
            $scope.chartData = data;
            setStats(data);
        }).catch(function(error){
            console.error("Can't get entries for " + insightId + " chart: ", error);
        });

        statistics.getPercentiles(insightId, $scope.player).then(function(percentileData){
            $scope.percentileData = percentileData;
        }, function(error){
            console.error(error);
        });
    }

    function setStats(data){
        var stats = [],
            values = [];

        if (!data || !data.length){
            $scope.stats = null;
            return;
        }

        data.forEach(function(item){
            values.push(item.properties[insightId]);
        });

        stats.push({
            color: "#00acd7",
            title: "Average gain per month",
            value: ((Math.max.apply(null, values) - Math.min.apply(null, values)) / utils.dates.millisecondsToMonths(data[data.length - 1].date - data[0].date)).toFixed(2) + config.localization[insightId].selected
        });

        $scope.stats = stats;
    }

}]);