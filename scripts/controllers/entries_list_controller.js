'use strict';

app.controller("EntriesListController", ["$scope", "$sce", "utils", "eventBus", "entries", function($scope, $sce, utils, eventBus, entries){
    var entryHtmlParsers = {};

    $scope.entries = [];

    eventBus.subscribe("newEntry", addEntry);

    function addEntry(newEntry){
        newEntry.html = $sce.trustAsHtml(utils.strings.parse(newEntry.type.html, newEntry, $scope));
        $scope.entries.splice(0, 0, newEntry);
    }
}]);