(function(){
    angular.module("Dialogs").factory("Dialog", DialogClassFactory);

    function DialogClassFactory(){
        function Dialog(config){
            this.isOpen = false;
            this.htmlUrl = config.htmlUrl;
            this.title = config.title;
            this.icon = config.icon;
        }

        Dialog.prototype.open = function(){
            this.isOpen = true;
        };

        Dialog.prototype.close = function(){
            this.isOpen = false;
        };

        Dialog.prototype.toggle = function(){
            this.isOpen = !this._isOpen;
        };

        return Dialog;
    }
})();