angular.module("SmartTable", []).directive("smartTable", function(){
    return {
        restrict: "E",
        scope: {
            columns: "=",
            enableGrouping: "=",
            sortBy: "="
        },
        require: "?ngModel",
        link: postLink
    };

    function postLink(scope, element, attrs, ngModel){

    }

    function sortTableData(rawData, columns, sortBy){
        var tableData = rawData.sort(function(a, b){

        });
    }
});