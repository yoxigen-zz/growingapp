define(["angular", "modules/dialogs/dialog_class"], function(angular){
    'use strict';

    angular.module("Dialogs").factory("dialogs", dialogs);

    dialogs.$inject = ["Dialog"];

    function dialogs(Dialog){
        var _dialogs = {
            signIn: { htmlUrl: "views/login.html", title: "Sign In" },
            signUp: { htmlUrl: "views/signup.html", title: "Sign Up" },
            imageMethodSelect: { htmlUrl: "views/image_method_select.html" },
            menu: {  },
            currentInsight: { actions: [ { icon: "plus", title: "Add entry" } ] },
            editPlayer: { htmlUrl: "views/edit_player.html" },
            syncOffer: { htmlUrl: "views/syncOffer.html", title: "It's time to backup!" },
            newPlayer: {  },
            editEntry: { },
            unremoveEntry: {},
            newEntry: { title: "New Entry Type" },
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
});