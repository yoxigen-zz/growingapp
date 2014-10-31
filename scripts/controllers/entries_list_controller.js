'use strict';

app.controller("EntriesListController", ["$scope", "$sce", "$timeout", "utils", "eventBus", "entries", "Entry", "config", function($scope, $sce, $timeout, utils, eventBus, entries, Entry, config){
    eventBus.subscribe("newEntry", addEntry);
    eventBus.subscribe("editPlayer", setEntries);
    eventBus.subscribe("playerSelect", setEntries);
    eventBus.subscribe("updateEntries", onUpdateEntries);

    $scope.$on("$destroy", function(){
        eventBus.unsubscribe("newEntry", addEntry);
        eventBus.unsubscribe("editPlayer", setEntries);
        eventBus.unsubscribe("playerSelect", setEntries);
        eventBus.unsubscribe("updateEntries", onUpdateEntries);
    });

    var removedEntryIndex;

    $scope.removeEntry = function(){
        var entry = $scope.entry;
        removedEntryIndex = $scope.entries.indexOf(utils.arrays.find($scope.entries, function(obj){ return obj.timestamp === entry.timestamp; }));
        entry.remove();
        $scope.entries.splice(removedEntryIndex, 1);
        eventBus.triggerEvent("deleteEntry", entry);
        $scope.removedEntry = entry;
        $scope.showEditEntry = false;
        setTimeout(function(){
            document.body.addEventListener("mousedown", onClickAfterRemove);
        }, 50);
    };

    $scope.unremoveEntry = function(){
        if (!$scope.removedEntry)
            return false;

        $scope.removedEntry.unremove();
        $scope.entries.splice(removedEntryIndex, 0, parseEntry($scope.removedEntry));
        eventBus.triggerEvent("saveEntry", $scope.removedEntry);
        hideUnremoveMessage();
    };

    $scope.currentEntriesType = "";
    $scope.entryTypes = entries.typesArray;

    $scope.onEntriesTypeChange = function(){
        setEntries();
    };

    $scope.entryClick = function(entry){
        openEditEntryDialog(entry.type);
        $scope.entry = new Entry(entry);
        $scope.editedEntryIsNew = false;
        setEntryPopupButtons(true);
    };

    $scope.showNewEntryForm = function(entryType){
        openEditEntryDialog(entryType);
        $scope.entry = new Entry(entryType, $scope.player);
        $scope.editedEntryIsNew = true;
        $scope.showNewEntriesSelection = false;
        setEntryPopupButtons(false);
    };

    $scope.toggleNewEntriesSelection = function(state){
        $scope.showNewEntriesSelection = state === true || state === false ? state : !$scope.showNewEntriesSelection;
    };

    $scope.saveEntry = function(){
        $scope.entry.save().then(function(savedEntry){
            $scope.showEditEntry = false;
            $scope.toggleNewEntriesSelection(false);
            if (savedEntry.isNew) {
                addEntry(savedEntry);
                eventBus.triggerEvent("saveEntry", savedEntry);
            }
            else {
                updateEntry($scope.entry);
                eventBus.triggerEvent("saveEntry", $scope.entry);
            }
        }, function(error){
            console.error("Couldn't save entry", error);
        });
    };

    function setEntryPopupButtons(isEdit){
        var buttons = [
            { icon: "ok", title: "Save entry", onClick: $scope.saveEntry }
        ];

        if (isEdit)
            buttons.splice(0, 0, { icon: "trash", title: "Delete entry", onClick: $scope.removeEntry });

        $scope.entryPopupButtons = buttons;
    }

    function onClickAfterRemove(e){
        if (e.target.id !== "undoEntryRemove") {
            $scope.$apply(hideUnremoveMessage);
            document.body.removeEventListener("mousedown", onClickAfterRemove);
        }
    }

    function hideUnremoveMessage(){
        $scope.removedEntry = null;
    }

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
        if (!config.sync.lastSyncTimestamp && !config.sync.synOfferDeclined && $scope.entries.length >= config.sync.syncOfferEntryCount)
            $scope.openSyncOffer();
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

        newEntry.dateText = newEntry.date.toLocaleDateString() + " (" + utils.dates.dateDiff(newEntry.date, $scope.player.birthday) + ")";
        return newEntry;
    }

    var settingEntries;
    function setEntries(data){
        if ($scope.player && $scope.player.playerId) {
            if (settingEntries)
                return;

            settingEntries = true;

            Entry.getEntries({ type: $scope.currentEntriesType, playerId: $scope.player.playerId, reverse: true }).then(function (entryValues) {
                if (settingEntries)
                    $scope.entries = entryValues.map(parseEntry);
            }).finally(function(){
                settingEntries = false;
            }).catch(function(error){
                $scope.entries = [];
                console.error("Error getting entries: ", error);
            });
        }
        else {
            settingEntries = false;
            $scope.entries = [];
        }
    }

    function onUpdateEntries(data){
        var entriesIndex = {},
            handled = 0;

        data.entries.forEach(function(entry){
            if (entry.player.playerId !== $scope.player.playerId)
                return true;

            if (entry.isNew) {
                var parsedEntry = parseEntry(entry);
                if (!~$scope.entries.indexOf(parsedEntry))
                    $scope.entries.push(parsedEntry);

                handled++;
            }
            else
                entriesIndex[entry.timestamp] = entry;
        });

        var indexEntry;
        for(var i= 0, entry; i < $scope.entries.length; i++){
            entry = $scope.entries[i];
            if (indexEntry = entriesIndex[entry.timestamp]){
                if (!indexEntry.isNew) {
                    if (indexEntry._deleted)
                        $scope.entries.splice(i, 1);
                    else
                        $scope.entries[i] = parseEntry(indexEntry);
                }
                handled++;
                if (handled === data.entries.length)
                    break;
            }
        }

        sortEntries();
    }
    setEntries();
}]);