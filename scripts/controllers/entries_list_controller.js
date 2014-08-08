'use strict';

app.controller("EntriesListController", ["$scope", "$sce", "utils", "eventBus", "entries", function($scope, $sce, utils, eventBus, entries){
    var entryHtmlParsers = {};

    $scope.entries = [];

    eventBus.subscribe("newEntry", addEntry);

    function addEntry(newEntry){
        newEntry.html = $sce.trustAsHtml(angular.isFunction(newEntry.type.html)
            ? newEntry.type.html(newEntry, $scope.child, $scope.config)
            : utils.strings.parse(newEntry.type.html, newEntry, $scope));

        newEntry.dateText = newEntry.date.toLocaleDateString() + " | " + utils.dates.dateDiff(newEntry.date, $scope.child.birthday);
        $scope.entries.splice(0, 0, newEntry);
    }
}]);