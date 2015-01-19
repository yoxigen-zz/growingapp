(function(){
    angular.module("Dialogs").factory("Dialog", DialogClassFactory);

    DialogClassFactory.$inject = ["eventBus"];

    function DialogClassFactory(eventBus){
        function Dialog(config){
            this.isOpen = false;
            this.htmlUrl = config.htmlUrl;
            this.title = config.title;
            this.icon = config.icon;
            this.actions = config.actions;
        }

        Dialog.prototype.open = function(){
            this.isOpen = true;
        };

        Dialog.prototype.close = function(){
            this.isOpen = false;
            eventBus.triggerEvent("popup.close", this);
        };

        Dialog.prototype.toggle = function(){
            this.isOpen = !this._isOpen;
        };

        return Dialog;
    }
})();