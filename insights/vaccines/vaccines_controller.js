angular.module("Vaccines").controller("VaccinesController", ["vaccines", function(vaccines){
    vaccines.getVaccines();
}]);