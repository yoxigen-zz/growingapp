app.controller("NewEntryController", ["$scope", "entries", "Entry", "eventBus", function($scope, entries, Entry, eventBus){
    $scope.entryTypes = entries.typesArray;

    $scope.showNewEntryForm = function(entryType){
        $scope.newEntryType = entryType;
        $scope.showNewEntry = true;
        //$scope.toggleNewEntriesSelection(false);

        $scope.entry = new Entry(entryType, $scope.player);
    };

    $scope.saveEntry = function(){
        $scope.entry.save().then(function(savedEntry){
            console.log("saved: ", savedEntry);
            $scope.showNewEntry = false;
            $scope.toggleNewEntriesSelection(false);
            eventBus.triggerEvent(savedEntry.isNewEntry ? "newEntry" : "updatedEntry", savedEntry);
        }, function(error){
            console.error("Couldn't save entry", error);
        });
    };
}]);