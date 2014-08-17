'use strict';

angular.module("Utils", []).factory("utils", ["$filter", function($filter){
    var stringParsers = {},
        dayMilliseconds = 1000 * 60 * 60 * 24;

    function getValueVariable(val, data, scope){
        var pathProperties = val.split("."),
            isData = pathProperties[0] === "data" && pathProperties.shift(),
            obj = isData ? data : scope,
            finalVariable = obj;

        if (pathProperties.length){
            for(var i=0; i < pathProperties.length; i++){
                finalVariable = finalVariable[pathProperties[i]];
                if (!finalVariable)
                    return null;
            }
        }

        return finalVariable;
    }

    function analyzeExpression(expression, data, scope){
        var params = expression.split(/(?:\s+)?\|\|(?:\s+)?/),
            filtersExpression = params.pop(),
            expressionAndFilters = filtersExpression.split(/(?:\s+)?\|(?:\s+)?/),
            filters,
            value;

        params.push(expressionAndFilters.shift());

        for(var i=0, param; i < params.length; i++){
            param = params[i];
            if (!param)
                continue;
            else{
                if (value = getValueVariable(param, data, scope))
                    break;
            }
        }

        if (!expressionAndFilters.length)
            return { value: value };

        filters = [];

        var filterExpression,
            filterParts;

        for(i= 0; i < expressionAndFilters.length; i++){
            filterExpression = expressionAndFilters[i];
            filterParts = filterExpression.split(/(?:\s+)?:(?:\s+)?/);

            filters.push({
                filterName: filterParts[0],
                params: filterParts.slice(1)
            });
        }

        return {
            value: value,
            filters: filters
        };
    }

    var monthsOffset = [1, -2, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1];

    var methods = {
        arrays: {
            toSentence: function(array, connector, wrapper){
                var arrayCopy = angular.copy(array);

                connector = connector || "and";

                if (arrayCopy.length < 2)
                    return arrayCopy.toString();

                if (wrapper){
                    arrayCopy.forEach(function(member, i){
                        arrayCopy[i] = wrapper + member + wrapper;
                    });
                }

                return arrayCopy.slice(0, -1).join(", ") + " " + connector + " " + arrayCopy[arrayCopy.length - 1];
            }
        },
        dates: {
            dateDays: function(d){
                var days = d.getDate();
                for(var month = 0; month < d.getMonth(); month++){
                    days += 30 + monthsOffset[month];
                }

                return days;
            },
            daysOffset: function(d1, d2){
                var offset = 0,
                    d1Copy = new Date(d1), d2Copy = new Date(d2);

                d2Copy.setYear(d1Copy.getFullYear());

                var firstDate = d1Copy < d2Copy ? d1Copy : d2Copy,
                    secondDate = firstDate === d1Copy ? d2Copy : d1Copy,
                    month1 = firstDate.getMonth(), month2 = secondDate.getMonth(),
                    date1 = firstDate.getDate(), date2 = secondDate.getDate(),
                    secondDateIsHigher = date2 >= date1,
                    date1Days = this.dateDays(firstDate),
                    date2Days = this.dateDays(secondDate),
                    monthsCount = 0;

                if (month1 === month2)
                    return { days: Math.abs(d1.getDate() - d2.getDate()), months: 0 };

                for (var month = month1; month < month2; month++){
                    if (month < month2 - 1 || secondDateIsHigher) {
                        offset += 30 + monthsOffset[month];
                        monthsCount++;
                    }
                }

                return { days: date2Days - date1Days - offset, months: monthsCount };
            },
            dateDiff: function(d1, d2){
                var year1 = d1.getFullYear(), year2 = d2.getFullYear(),
                    years = Math.abs(year1 - year2),
                    daysAndMonths = this.daysOffset(d1, d2),
                    str = [];

                if (years)
                    str.push(years + " year" + (years > 1 ? "s" : ""));

                if (daysAndMonths.months)
                    str.push(daysAndMonths.months + " month" + (daysAndMonths.months > 1 ? "s" : ""));

                if (daysAndMonths.days)
                    str.push(daysAndMonths.days + " day" + (daysAndMonths.days > 1 ? "s" : ""));

                return str.length ? methods.arrays.toSentence(str) + " old" : "Birthday!";
            }
        },
        strings: {
            escapeHtml: function(str){
                return str.replace(/\&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            },
            parse: function(expression, data, scope){
                if (!expression)
                    return "";

                    return expression.replace(/\{\{([^\}]+)\}\}/g, function(match, nestedExpression){
                        var analyzedExpression = analyzeExpression(nestedExpression, data, scope);
                        if (analyzedExpression.filters){
                            var filteredValue = "";
                            analyzedExpression.filters.forEach(function(filter, i){
                                filteredValue = $filter(filter.filterName).apply(this, [i ? filteredValue : analyzedExpression.value].concat(filter.params));
                            });
                            return filteredValue;
                        }
                        else
                            return analyzedExpression.value;

                    });
            }
        }
    };

    return methods;
}]);