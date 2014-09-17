'use strict';

app.controller("EntriesListController", ["$scope", "$sce", "$timeout", "utils", "eventBus", "entries", "Entry", function($scope, $sce, $timeout, utils, eventBus, entries, Entry){
    eventBus.subscribe("newEntry", addEntry);
    eventBus.subscribe("editPlayer", setEntries);
    eventBus.subscribe("playerSelect", setEntries);

    $scope.$on("$destroy", function(){
        eventBus.unsubscribe("newEntry", addEntry);
        eventBus.unsubscribe("editPlayer", setEntries);
        eventBus.unsubscribe("playerSelect", setEntries);
    });

    $scope.removeEntry = function($event, entry){
        $event.preventDefault();
        $event.stopPropagation();

        entry.removed = true;
        entry.removeTimeout = $timeout(function(){
            entry.remove();
            $scope.entries.splice($scope.entries.indexOf(entry), 1);
        }, 5000);

        return false;
    };

    $scope.undoRemoveEntry = function(entry){
        entry.removed = false;
        $timeout.cancel(entry.removeTimeout);
    };

    $scope.currentEntriesType = "";
    $scope.entryTypes = entries.typesArray;

    $scope.onEntriesTypeChange = function(){
        setEntries();
    };

    $scope.entryClick = function(entry){
        openEditEntryDialog(entry.type);
        $scope.entry = entry;
    };

    $scope.showEditEntryForm = function(entryType){
        openEditEntryDialog(entryType);
        $scope.entry = new Entry(entryType, $scope.player);
    };

    $scope.saveEntry = function(){
        $scope.entry.save().then(function(savedEntry){
            console.log("saved: ", savedEntry);
            $scope.showEditEntry = false;
            $scope.toggleNewEntriesSelection(false);
            if (savedEntry.isNewEntry)
                addEntry(savedEntry);
            else
                updateEntry($scope.entry);
        }, function(error){
            console.error("Couldn't save entry", error);
        });
    };

    function openEditEntryDialog(entryType){
        $scope.newEntryType = entryType;
        $scope.showEditEntry = true;
    }

    function sortEntries(){
        $scope.entries.sort(function(a, b){
            if (a.date === b.date)
                return 0;

            return a.date < b.date ? 1 : -1;
        });
    }

    function addEntry(newEntry){
        $scope.entries.splice(0, 0, parseEntry(newEntry));
        sortEntries();
    }

    function updateEntry(entry){
        parseEntry(entry);
        sortEntries();
    }

    function parseEntry(newEntry){
        try {
            newEntry.html = $sce.trustAsHtml(angular.isFunction(newEntry.type.html)
                ? newEntry.type.html(newEntry, $scope.player, $scope.config)
                : utils.strings.parse(newEntry.type.html, newEntry, $scope));
        }
        catch(e){
            newEntry.html = $sce.trustAsHtml("<span class='item-error'>Error parsing entry HTML!</span>");
        }

        newEntry.dateText = newEntry.date.toLocaleDateString() + " (" + utils.dates.dateDiff(newEntry.date, $scope.player.properties.birthday) + ")";
        return newEntry;
    }

    var settingEntries;
    function setEntries(){
        if ($scope.player && $scope.player.id) {
            if (settingEntries)
                return;

            settingEntries = true;

            Entry.getEntries({ type: $scope.currentEntriesType, playerId: $scope.player.id, reverse: true }).then(function (entryValues) {
                if (settingEntries)
                    $scope.entries = entryValues.map(parseEntry);
            }).finally(function(){
                settingEntries = false;
            });
        }
        else {
            settingEntries = false;
            $scope.entries = [];
        }
    }

    setEntries();
}]);