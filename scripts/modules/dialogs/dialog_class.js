define(["angular", "modules/dialogs/dialogs_module"], function(angular){
    "use strict";

    angular.module("Dialogs").factory("Dialog", DialogClassFactory);

    DialogClassFactory.$inject = ["EventBus"];

    function DialogClassFactory(EventBus){
        function Dialog(config){
            var eventBus = EventBus.setToObject(this, ["open", "close"]);

            this.isOpen = false;
            this.htmlUrl = config.htmlUrl;
            this.title = config.title;
            this.icon = config.icon;
            this.actions = config.actions;

            this.open = function(){
                this.isOpen = true;
                eventBus.triggerEvent("open");
            };

            this.close = function(shouldTriggerEvent){
                this.isOpen = false;

                if (shouldTriggerEvent !== false)
                    eventBus.triggerEvent("close");
            };
        }

        Dialog.prototype.toggle = function(){
            if (this.isOpen)
                this.close(true);
            else
                this.open();
        };

        return Dialog;
    }
});