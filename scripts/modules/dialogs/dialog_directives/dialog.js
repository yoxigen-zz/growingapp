angular.module("Dialogs").directive("dialog", ["DialogDirective", function(DialogDirective){
    return new DialogDirective("scripts/modules/dialogs/dialog_directives/dialog.template.html");
}]);