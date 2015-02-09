define(["app"], function(app) {
    "use strict";

    app.controller("LineChartInsightController", lineChartInsightController);

    lineChartInsightController.$inject = ["$scope", "$filter", "Entry", "utils", "eventBus", "config", "statistics", "localization", "insights", "entriesModel"];

    function lineChartInsightController($scope, $filter, Entry, utils, eventBus, config, statistics, localization, insights, entriesModel) {
        var insightId = insights.currentInsight.id,
            unit = localization.units[insightId][config.localization[insightId].selected],
            unitFilter = $filter("unit");

        init();

        function init(){
            eventBus.subscribe("playerSelect", setData);

            $scope.$on("$destroy", function(){
                eventBus.unsubscribe("playerSelect", setData);
                entriesModel.onNewEntry.unsubscribe(onNewEntry);
            });

            $scope.chartSettings = {
                dataSeries: "player.name",
                x: "age",
                y: "unitValue",
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

            entriesModel.onNewEntry.subscribe(onNewEntry);
        }

        function setData() {
            if (!$scope.player || !$scope.player.playerId){
                $scope.chartData = [];
                return;
            }

            Entry.getEntries({ playerId: $scope.player.playerId, type: insightId }).then(function (chartEntries) {
                $scope.chartData = chartEntries;
                setStats(chartEntries);
            }).catch(function(error){
                console.error("Can't get entries for " + insightId + " chart: ", error);
            });

            statistics.getPercentiles(insightId, $scope.player, unit.name).then(function(percentileData){
                $scope.percentileData = percentileData;
            }, function(error){
                console.error(error);
            });
        }

        function onNewEntry(entry){
            if (insights.currentInsight.entryType === entry.type){
                var newData = Array.prototype.slice.call($scope.chartData, 0);
                newData.push(entry);
                newData.sort(function(a,b){
                    if (a.date === b.date)
                        return 0;

                    if (a.date > b.date)
                        return 1;

                    return -1;
                });

                $scope.chartData = newData;
            }
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
    }
});