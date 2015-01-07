angular.module("Vaccines").controller("VaccinesController", ["vaccines", function(vaccines){
    var vm = this;
    vaccines.getVaccines().then(function(vaccineEntries){
        vm.entries = vaccineEntries;
    });
}]);