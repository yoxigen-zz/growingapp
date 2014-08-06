'use strict';

angular.module("Utils", []).factory("utils", ["$filter", function($filter){
    var stringParsers = {};

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

    return {
        strings: {
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
    }
}]);