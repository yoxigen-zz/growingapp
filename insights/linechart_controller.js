'use strict';

app.controller("LineChartInsightController", ["$scope", "$filter", "Entry", "utils", "eventBus", "config", "statistics", "localization", function($scope, $filter, Entry, utils, eventBus, config, statistics, localization){
    var insightId = $scope.currentInsight.id,
        unit = localization.units[insightId][config.localization[insightId].selected],
        unitFilter = $filter("unit");

    eventBus.subscribe("playerSelect", setData);

    $scope.$on("$destroy", function(){ eventBus.unsubscribe("playerSelect", setData); });

    $scope.chartSettings = {
        dataSeries: "player.name",
        x: "age",
        y: "value",
        interpolate: "cardinal",
        "axes": {
            "x": {
                "type": "age",
                "tickFormat": "age",
                renderGrid: false
            },
            "y": {
                tickFormat: "d",
                unit: unit.display
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
            $scope.chartData = data.map(function(item){
                var itemCopy = angular.copy(item);
                itemCopy.value = unitFilter(item.properties.value || item.properties[insightId], insightId, item.properties.value);
                return itemCopy;
            });

            setStats(data);
        }).catch(function(error){
            console.error("Can't get entries for " + insightId + " chart: ", error);
        });

        statistics.getPercentiles(insightId, $scope.player, unit.name).then(function(percentileData){
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

        values = data.map(function(item){
            return unitFilter(item.properties.value || item.properties[insightId], insightId, item.properties.value);
        });

        stats.push({
            color: "#00acd7",
            title: "Average gain per month",
            value: ((Math.max.apply(null, values) - Math.min.apply(null, values)) / utils.dates.millisecondsToMonths(data[data.length - 1].date - data[0].date)).toFixed(2) + config.localization[insightId].selected
        });

        $scope.stats = stats;
    }

}]);