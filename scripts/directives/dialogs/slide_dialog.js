angular.module("Dialogs").directive("slideDialog", ["Dialog", function(Dialog){
    return new Dialog("scripts/directives/dialogs/slide_dialog.template.html");
}]);