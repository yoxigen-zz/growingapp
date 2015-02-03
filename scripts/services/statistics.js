app.factory("statistics", ["utils", function(utils){
    var methods = {
        getPercentiles: function(chartId, player, units){
            return utils.data.getCsv("data/" + chartId + "_" + player.gender.id + "_weeks_" + units + ".csv", function(d) {
                return {
                    P05: +d.P5,
                    P10: +d.P10,
                    P25: +d.P25,
                    P50: +d.P50,
                    P75: +d.P75,
                    P90: +d.P90,
                    P95: +d.P95
                };
            }).then(function(data){
                 var series = [
                     { name: "5%", className: "P5", values: [] },
                     { name: "10%", className: "P10", values: [] },
                     { name: "25%", className: "P25", values: [] },
                     { name: "50%", className: "P50", values: [] },
                     { name: "75%", className: "P75", values: [] },
                     { name: "90%", className: "P90", values: [] },
                     { name: "95%", className: "P95", values: [] }
                 ];

                var ageInWeeks = Math.ceil(player.getAge() / 7);

                for(var week= 0, row, i, p; row = data[week]; week++){
                    i=0;

                    for(p in row){
                        series[i].values.push({ age: week * 7, value: row[p] });
                        i++;
                    }

                    if (week == ageInWeeks)
                        break;
                }

                return series;
            });
        }
    };

    return methods;
}]);