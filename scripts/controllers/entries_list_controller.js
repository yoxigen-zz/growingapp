'use strict';

app.controller("EntriesListController", ["$scope", "$sce", "$timeout", "utils", "eventBus", "entries", "Entry", function($scope, $sce, $timeout, utils, eventBus, entries, Entry){
    eventBus.subscribe("newEntry", addEntry);

    $scope.removeEntry = function(entry){
        entry.removed = true;
        entry.removeTimeout = $timeout(function(){
            entry.remove();
            $scope.entries.splice($scope.entries.indexOf(entry), 1);
        }, 5000);
    };

    $scope.undoRemoveEntry = function(entry){
        entry.removed = false;
        $timeout.cancel(entry.removeTimeout);
    };

    $scope.entryTypes = [{ name: "All entry types" }].concat(entries.typesArray);

    $scope.onEntriesTypeChange = function(){
        setEntries($scope.currentEntriesType);
    };

    function addEntry(newEntry){
        $scope.entries.splice(0, 0, parseEntry(newEntry));
        $scope.entries.sort(function(a, b){
            if (a.date === b.date)
                return 0;

            return a.date < b.date ? 1 : -1;
        });
    }

    function parseEntry(entryData){
        var newEntry = entryData instanceof Entry ? entryData : new Entry(entryData);
        //if (typeof(newEntry.type) === "string")
            //newEntry.type = entries.types[newEntry.type];

        try {
            newEntry.html = $sce.trustAsHtml(angular.isFunction(newEntry.type.html)
                ? newEntry.type.html(newEntry, $scope.player, $scope.config)
                : utils.strings.parse(newEntry.type.html, newEntry, $scope));
        }
        catch(e){
            newEntry.html = $sce.trustAsHtml("<span class='item-error'>Error parsing entry HTML!</span>");
        }

        newEntry.dateText = newEntry.date.toLocaleDateString() + " (" + utils.dates.dateDiff(newEntry.date, $scope.player.birthday) + ")";
        return newEntry;
    }

    function setEntries(entriesType){
        if ($scope.player) {
            Entry.getEntries({ type: entriesType, playerId: $scope.player.id }).then(function (entryValues) {
                $scope.entries = entryValues.map(parseEntry);
            });
        }
    }

    setEntries();
}]);