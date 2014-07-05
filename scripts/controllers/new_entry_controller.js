app.controller("NewEntryController", ["$scope", "entries", function($scope, entries){
    $scope.entryTypes = entries.types;

    $scope.showNewEntryForm = function(entryType){
        $scope.newEntryType = entryType;
        $scope.showNewEntry = true;
    };
}]);