define(["angular", "modules/dialogs/dialog_directive"], function(angular){
    "use strict";

    angular.module("Dialogs").directive("slideDialog", ["DialogDirective", function(DialogDirective){
        return new DialogDirective("scripts/modules/dialogs/dialog_directives/slide_dialog.template.html");
    }]);
});