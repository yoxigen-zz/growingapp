define(["angular", "modules/dialogs/dialog_class"], function(angular){
    'use strict';

    angular.module("Dialogs").factory("dialogs", dialogs);

    dialogs.$inject = ["Dialog", "config", "users"];

    function dialogs(Dialog, config, users){
        var _dialogs = {
            about: { htmlUrl: "views/about.html", title: "About GrowingApp" },
            contact: { htmlUrl: "views/contact.html", title: "Contact Us" },
            currentInsight: { actions: [ { icon: "plus", title: "Add entry" } ] },
            editEntry: { },
            editPlayer: { htmlUrl: "views/edit_player.html" },
            imageMethodSelect: { htmlUrl: "views/image_method_select.html" },
            menu: {  },
            newEntry: { title: "New Entry Type" },
            newPlayer: {  },
            settings: { htmlUrl: "views/settings.html", title: "Settings", icon: "settings_white" },
            signIn: { htmlUrl: "views/login.html", title: "Sign In", actions: [
                { text: "New user?", onClick: function(){
                    openDialog("signUp", true);
                } }
            ] },
            signUp: { htmlUrl: "views/signup.html", title: "Sign Up" },
            syncOffer: { htmlUrl: "views/syncOffer.html", title: "It's time to backup!", actions: [
                { text: "Don't backup", onClick: declineSyncOffer },
                { text: "Backup now", onClick: function(){
                    openDialog("signUp", true);
                } }
            ] },
            unremoveEntry: {}
        };

        for(var dialogId in _dialogs){
            _dialogs[dialogId] = new Dialog(_dialogs[dialogId]);
        }

        // After login, all dialogs should be closed no matter what:
        users.onLogin.subscribe(closeAll);

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

        function declineSyncOffer(){
            dialogs.syncOffer.close();
            config.sync.declineSyncOffer();
        }
    }
});