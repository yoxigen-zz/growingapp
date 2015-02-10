define(["angular", "d3", "moment"], function(angular, d3, moment){
    'use strict';

    return angular.module("Utils", []).factory("utils", ["$filter", "$rootScope", "$q", function($filter, $rootScope, $q){
        var stringParsers = {},
            dayMilliseconds = 1000 * 60 * 60 * 24,
            avgMonthLength = 365 / 12;

        var rtlRegExp = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;

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
                find: function(array, findFunction){
                    if (!angular.isArray(array) || !array || !array.length)
                        return null;

                    var member;
                    for(var i=0; i < array.length; i++){
                        if (findFunction(member = array[i]))
                            return member;
                    }

                    return null;
                },
                toIndex: function(array, idPropery){
                    var index = {};
                    array.forEach(function(member){
                        if (!member)
                            return true;

                        var id = member[idPropery];
                        if (!id)
                            return true;

                        index[id] = member;
                    });
                    return index;
                },
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
                },
                uniqueValues: function(array){
                    var unique = [];

                    array.forEach(function(member){
                        if (!~unique.indexOf(member)){
                            unique.push(member);
                        }
                    });

                    return unique;
                }
            },
            data: {
                getCsv: function(url, accessor){
                    var deferred = $q.defer();

                    d3.csv(url, accessor, function(error, data){
                        $rootScope.$apply(function(){
                            if (error)
                                deferred.reject(error);
                            else
                                deferred.resolve(data);
                        });
                    });

                    return deferred.promise;
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
                dateDiff: function(d1, d2, isShort){
                    var duration = moment.duration(Math.abs(d1 - d2));

                    if (duration.asDays() < 1)
                        return "Birthday";

                    var lastDate = d1 > d2 ? d1 : d2,
                        firstDate = d1 === lastDate ? d2 : d1;

                    var years = lastDate.getFullYear() - firstDate.getFullYear(),
                        months = lastDate.getMonth() - firstDate.getMonth(),
                        days = lastDate.getDate() - firstDate.getDate(),
                        str = [];

                    if (days < 0){
                        days += 30;
                        months -= 1;
                    }

                    if (months < 0){
                        months += 12;
                        years -= 1;
                    }


                    if (isShort){
                        if (years)
                            str.push(years + "y");

                        if (years || months)
                            str.push(months + "m");

                        if (days)
                            str.push(days + "d");

                        return str.join(" ");
                    }
                    else{
                        var val;
                        if (years) {
                            val = years + " year";
                            if (years > 1)
                                val += "s";

                            str.push(val);
                        }

                        if (months) {
                            val = months + " month";
                            if (months > 1)
                                val += "s";

                            str.push(val);
                        }

                        if (!years && !months) {
                            val = days + " day";
                            if (days > 1)
                                val += "s";

                            str.push(val);
                        }

                        return methods.arrays.toSentence(str) + " old";
                    }
                },
                daysToMonths: function(days){
                    return Math.floor(days / avgMonthLength);
                },
                millisecondsToMonths: function(milli){
                    return Math.floor(milli / dayMilliseconds / avgMonthLength);
                }
            },
            math: {
                avg: function (data, field) {
                    return methods.math.sum(data, field) / data.length;
                },
                max: function(data, field){
                    if (!data || !data.length)
                        return null;

                    var value = -Infinity;

                    data.forEach(function(item){
                        value = Math.max(field ? item[field] : item, value);
                    });

                    return value;
                },
                min: function(data, field){
                    if (!data || !data.length)
                        return null;

                    var value = Infinity;

                    data.forEach(function(item){
                        value = Math.min(field ? item[field] : item, value);
                    });

                    return value;
                },
                sum: function(data, field){
                    var sum = 0;
                    if (field) {
                        data.forEach(function (item) {
                            sum += item[field];
                        });
                    }
                    else{
                        data.forEach(function (item) {
                            sum += item;
                        });
                    }
                }
            },
            objects: {
                getObjectByPath: function(rootObj, path){
                    var parts = path.split("."),
                        obj = rootObj;

                    for(var i= 0, part; part = parts[i]; i++){
                        obj = obj[part];
                        if (obj === null || obj === undefined)
                            return obj;
                    }

                    return obj;
                }
            },
            strings: {
                escapeHtml: function(str){
                    return str.replace(/\&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                },
                isRtl: function(str){
                    if (!str)
                        return false;

                    return rtlRegExp.test(str);
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
});