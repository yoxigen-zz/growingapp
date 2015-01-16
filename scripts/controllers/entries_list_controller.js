'use strict';

app.controller("EntriesListController", ["$scope", "entries", "localization", "insights", "entriesModel",
    function($scope, entries, localization, insights, entriesModel){
    $scope.entries = entriesModel;
    $scope.localizationUnits = localization.units;
    $scope.entryTypes = entries.typesArray;
    $scope.onEntriesTypeChange = entriesModel.setEntries;
    $scope.insights = insights;
}]);