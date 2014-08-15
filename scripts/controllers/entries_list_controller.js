'use strict';

app.controller("EntriesListController", ["$scope", "$sce", "utils", "eventBus", "entries", "Entry", function($scope, $sce, utils, eventBus, entries, Entry){
    eventBus.subscribe("newEntry", addEntry);

    function addEntry(newEntry){
        $scope.entries.splice(0, 0, parseEntry(newEntry));
    }

    function parseEntry(entry){
        var newEntry = angular.copy(entry);
        if (typeof(newEntry.type) === "string")
            newEntry.type = entries.types[newEntry.type];

        newEntry.html = $sce.trustAsHtml(angular.isFunction(newEntry.type.html)
            ? newEntry.type.html(newEntry, $scope.child, $scope.config)
            : utils.strings.parse(newEntry.type.html, newEntry, $scope));

        newEntry.dateText = newEntry.date.toLocaleDateString() + " | " + utils.dates.dateDiff(newEntry.date, $scope.child.birthday);
        return newEntry;
    }
    
    Entry.getEntries().then(function(entryValues){
        $scope.entries = entryValues.map(parseEntry);
    });
}]);