'use strict';

app.controller("EntriesListController", ["$scope", "$parse", "eventBus", "entries", function($scope, $parse, eventBus, entries){
    var entryHtmlParsers = {};

    $scope.entries = [];

    eventBus.subscribe("newEntry", addEntry);

    function addEntry(newEntry){
        var parser = entryHtmlParsers[newEntry.type.id];

        if (!parser)
            parser = entryHtmlParsers[newEntry.type.id] = $parse(newEntry.type.html);

        if (!parser)
            throw new Error("Entry HTML parser for entry of type " + newEntry.type.name + " not found.");

        newEntry.html = parser($scope, newEntry);
        $scope.entries.splice(0, 0, newEntry);
    }
}]);