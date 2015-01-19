angular.module("Vaccines").controller("VaccinesController", ["$scope", "vaccines", "entriesModel", "utils", function($scope, vaccines, entriesModel, utils){
    var vm = this;

    vm.editEntry = entriesModel.editEntry;

    entriesModel.onNewEntry.subscribe(onNewEntry);
    entriesModel.onUpdateEntry.subscribe(onUpdateEntry);

    $scope.$on("$destroy", function(){
        entriesModel.onNewEntry.unsubscribe(onNewEntry);
        entriesModel.onUpdateEntry.unsubscribe(onUpdateEntry);
    });

    setVaccines();

    function onNewEntry(entry){
        if (entry.type.id === "vaccine") {
            vm.entries.push(entry);
            sortEntries();
        }
    }

    function onUpdateEntry(entry){
        if (entry.type.id === "vaccine") {
            var vaccineEntry = utils.arrays.find(vm.entries, function(_entry){
                return _entry.timestamp === entry.timestamp;
            });

            if (vaccineEntry){
                vm.entries.splice(vm.entries.indexOf(vaccineEntry), 1, entry);
            }

            sortEntries();
        }
    }

    function sortEntries(){
        vm.entries.sort(function(a,b){
            if (a.date === b.date)
                return 0;

            if (a.date > b.date)
                return -1;

            return 1;
        });
    }

    function setVaccines(){
        vaccines.getVaccines().then(function(vaccineEntries){
            vm.entries = vaccineEntries;
        });
    }
}]);