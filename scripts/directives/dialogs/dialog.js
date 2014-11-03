angular.module("Dialogs").directive("dialog", ["Dialog", function(Dialog){
    return new Dialog("scripts/directives/dialogs/dialog.template.html");
}]);