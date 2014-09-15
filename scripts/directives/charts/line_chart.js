'use strict';

angular.module('Charts')
    .directive('lineChart', ["Chart", "utils", function (Chart, utils) {
        return {
            template: '<div class="chart multiline"></div>',
            restrict: 'E',
            require: "?ngModel",
            replace: true,
            link: function postLink(scope, element, attrs, ngModel) {
                var defaultOptions = {
                        circleRadius: 3
                    },
                    chart = new Chart(defaultOptions, draw),
                    line,
                    points,
                    color;

                element.css("height", "100%");

                chart.getTooltipText = function(d){
                    return utils.strings.parseValue(chart.settings.tooltipText, d);
                };

                chart.preRender = function(){
                    color = chart.getColorScale();
                    chart.legendData = chart.data.map(function(d){
                        return { text: d.name, color: color(d.name) };
                    })
                };

                chart.init(scope, element, attrs);

                chart.onResize = function(){
                    chart.elements.path.attr("d", function(d) { return line(d.values); });
                    if (!points)
                        points = this.svg.selectAll(".point");

                    points
                        .attr("cx", function(d){
                            return chart.options.circleRadius/4 + chart.scale.x(utils.objects.getObjectByPath(d, chart.settings.x));
                        })
                        .attr("cy", function(d){
                            return chart.scale.y(utils.objects.getObjectByPath(d, chart.settings.y));
                        });
                };

                scope.$on("$destroy", function(){
                    element.off();
                    element.empty();
                });

                function draw(){
                    var self = this,
                        svg = this.dataSvg;

                    line = d3.svg.line()
                        .interpolate(chart.settings.interpolate || "linear")
                        .x(function(d) { return chart.scale.x(utils.objects.getObjectByPath(d, chart.settings.x)); })
                        .y(function(d) { return chart.scale.y(utils.objects.getObjectByPath(d, chart.settings.y)); });

                    chart.scale.x.domain(getDomain("x"));
                    chart.scale.y.domain(getDomain("y", chart.settings.minYValue, chart.settings.maxYValue));

                    chart.elements.series = svg.selectAll(".series")
                        .data(self.data)
                        .enter().append("g")
                        .attr("class", "series pointsGroup");

                    chart.elements.path = chart.elements.series.append("path")
                        .attr("class", "line")
                        .attr("d", function(d) { return line(d.values); })
                        .style("stroke", function(d) {
                            return color(d.name);
                        });


                    chart.elements.series.each(function(series, i){
                        d3.select(chart.elements.series[0][i]).selectAll(".point").data(series.values)
                            .enter().append("circle")
                            .attr("class", "point")
                            .attr("r", chart.options.circleRadius)
                            .attr("cx", function(d){
                                return chart.options.circleRadius/4 + chart.scale.x(utils.objects.getObjectByPath(d, chart.settings.x));
                            })
                            .attr("cy", function(d){
                                return chart.scale.y(utils.objects.getObjectByPath(d, chart.settings.y));
                            })
                            .attr("data-tooltip", chart.settings.tooltipText ? "" : null)
                            .attr("data-selectable", chart.settings.onSelect ? "" : null)
                            .style("fill", function(d){ return color(series.name)})
                    });
                }

                function getDomain(axis, minValue, maxValue){
                    var min, max,
                        property = chart.settings[axis];

                    chart.data.forEach(function(series){
                        series.values.forEach(function(item){
                            var value = utils.objects.getObjectByPath(item, property);
                            if (minValue === undefined) {
                                if (min === undefined || value < min)
                                    min = value;
                            }

                            if (maxValue === undefined) {
                                if (max === undefined || value > max)
                                    max = value;
                            }
                        });
                    });

                    return[min !== undefined ? min : minValue, max !== undefined ? max : maxValue];
                }
            }
        };
    }]);
