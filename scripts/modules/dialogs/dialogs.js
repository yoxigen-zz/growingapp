(function(){
    'use strict';

    angular.module("Dialogs").factory("dialogs", dialogs);

    dialogs.$inject = ["config", "Dialog"];

    function dialogs(config, Dialog){
        var _dialogs = {
            signIn: { htmlUrl: "views/login.html", title: "Sign In" },
            signUp: { htmlUrl: "views/signup.html", title: "Sign Up" },
            menu: {  },
            editPlayer: {  },
            syncOffer: { htmlUrl: "views/syncOffer.html", title: "It's time to backup!" },
            newPlayer: {  },
            newEntry: {  },
            settings: { htmlUrl: "views/settings.html", title: "Settings", icon: "settings_white" }
        };

        for(var dialogId in _dialogs){
            _dialogs[dialogId] = new Dialog(_dialogs[dialogId]);
        }

        return angular.extend({
            closeAll: closeAll,
            openDialog: openDialog
        }, _dialogs);

        function openDialog(dialogId, closeOthers){
            var dialog = _dialogs[dialogId];
            if (!dialog)
                throw new Error("Unknown dialog with ID '" + dialogId + "'.");

            if (closeOthers)
                closeAll();

            dialog.open();

        }

        function closeAll(){
            for(var dialogId in _dialogs){
                _dialogs[dialogId].close();
            }
        }
    }
})();
