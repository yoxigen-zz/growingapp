define(["app"], function (app) {
    'use strict';

    app.factory("navigation", navigation);

    navigation.$inject = ["phonegap", "eventBus", "$route", "$rootScope", "users", "dialogs", "Dialog"];

    function navigation(phonegap, eventBus, $route, $rootScope, users, dialogs, Dialog) {
        var backButtonCallbacks = [],
            mainMenuItems = [
                { text: "Settings", icon: "images/icons/settings.svg", onClick: function(e){
                    e.preventDefault();
                    dialogs.settings.open();
                } },
                //{ text: "Share", href: "#/share", icon: "images/icons/share.svg" },
                { text: "Sync data with cloud", icon: "images/icons/cloud_sync.svg", className: "disable-offline", onClick: function(e){
                    e.preventDefault();

                    if (users.getCurrentUser())
                        eventBus.triggerEvent("sync");
                    else
                        dialogs.signIn.open();

                    dialogs.menu.close();
                } },
                { id: "signOut", hide: true, text: "Sign out", icon: "images/icons/sign_out.svg", onClick: function(e){
                    e.preventDefault();

                    if (window.confirm("Warning: All unsaved entries will be deleted. Continue?")){
                        users.logout();
                    }

                    dialogs.menu.close();
                } },
                { id: "contact", text: "Contact us", icon: "images/icons/mail.svg", className: "menu-item-separator", onClick: function(e){
                    e.preventDefault();
                    dialogs.contact.open();
                } },
                {
                    id: "about", text: "About GrowingApp", icon: "images/icons/info.svg", onClick: function(e){
                        e.preventDefault();
                        dialogs.about.open();
                    }
                }
            ],
            pages = [
                { name: "Diary", "url": "#/", icon: "images/icons/diary.svg", listIcon: "images/icons/diary-black.svg" },
                { name: "Insights", "url": "#/insights", icon: "images/icons/charts-white.svg", listIcon: "images/icons/charts.svg" }
            ];

        phonegap.onBackButton.addEventListener(onBackButton);

        function onBackButton(){
            $rootScope.safeApply(function(){
                if (backButtonCallbacks.length)
                    backButtonCallbacks.pop()();
                else
                    navigateUp();
            });
        }

        function navigateUp(){
            var currentPage = $route.current.$$route && $route.current.$$route.currentPage || "diary";
            if (currentPage === "diary"){
                navigator.app.exitApp();
            }
            else if (currentPage === "insights"){
                window.location.hash = "/";
            }
        }

        var methods = {
            addBackButtonCallback: function(callback){
                if (!(callback instanceof Function))
                    throw new TypeError("Invalid callback, expected a function but got " + callback);

                backButtonCallbacks.push(callback);
            },
            removeLastBackButtonCallback: function(){
                backButtonCallbacks.pop();
            },
            currentPage:  window.location.hash === "#/insights" ? pages[1] : pages[0],
            setCurrentPage: function(page){
                page = ~pages.indexOf(page) ? page : pages[0];
                methods.currentPage = page;
                window.location.hash = page.url;
            },
            mainMenuItems: mainMenuItems,
            pages: pages
        };

        $rootScope.$on("$routeChangeSuccess", function(){
            var currentPage = $route.current.$$route && $route.current.$$route.currentPage || "diary";
            methods.currentPage = currentPage === "diary" ? pages[0] : pages[1];
        });

        initDialogs();

        return methods;

        function initDialog(dialog){
            if (dialog instanceof Dialog){
                dialog.onClose.subscribe(methods.removeLastBackButtonCallback);
                dialog.onOpen.subscribe(function(){
                    methods.addBackButtonCallback(function(){
                        dialog.close(false);
                    });
                });
            }
        }

        function initDialogs(){
            for(var dialogName in dialogs){
                initDialog(dialogs[dialogName]);
            }
        }
    }
});