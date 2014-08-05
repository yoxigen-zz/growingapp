app.controller("NewEntryController", ["$scope", "entries", "Entry", function($scope, entries, Entry){
    $scope.entryTypes = entries.types;

    $scope.showNewEntryForm = function(entryType){
        $scope.newEntryType = entryType;
        $scope.showNewEntry = true;
        //$scope.toggleNewEntriesSelection(false);

        $scope.entry = new Entry(entryType);
    };

    $scope.saveEntry = function(){
        $scope.entry.save().then(function(savedEntry){
            console.log("saved: ", savedEntry.id, savedEntry.properties);
            $scope.showNewEntry = false;
            $scope.toggleNewEntriesSelection(false);
        }, function(error){
            console.error("Couldn't save entry", error);
        });
    };
}]);