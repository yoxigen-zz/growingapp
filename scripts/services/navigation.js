app.factory("navigation", ["phonegap", "eventBus", "$route", "$rootScope", "users", function(phonegap, eventBus, $route, $rootScope, users){
    var openPopup,
        mainMenuItems = [
            //{ text: "Settings", href: "#/settings", icon: "images/icons/settings.svg" },
            //{ text: "Share", href: "#/share", icon: "images/icons/share.svg" },
            //{ text: "Feedback / Bugs", href: "#/", icon: "images/icons/mail.svg" },
            { text: "Sync data with cloud", icon: "images/icons/cloud_sync.svg", className: "disable-offline", onClick: function(e){
                e.preventDefault();

                if (users.getCurrentUser())
                    eventBus.triggerEvent("sync");
                else
                    eventBus.triggerEvent("showLogin");

                eventBus.triggerEvent("hideMenu");
            } },
            { id: "signOut", hide: true, text: "Sign out", icon: "images/icons/sign_out.svg", onClick: function(e){
                e.preventDefault();
                eventBus.triggerEvent("hideMenu");
                users.logout();
                eventBus.triggerEvent("logout");
            } }
        ];

    phonegap.onBackButton.addEventListener(onBackButton);
    eventBus.subscribe("popup.open", function(popup){ openPopup = popup; });
    eventBus.subscribe("popup.close", function(){ openPopup = null; });

    function onBackButton(){
        $rootScope.safeApply(function(){
            if (openPopup)
                openPopup.closeDialog();
            else
                navigateUp();
        });
    }

    window.backup = onBackButton;

    function navigateUp(){
        var currentPage = $route.current.$$route && $route.current.$$route.currentPage || "diary";
        if (currentPage === "diary"){
            if (confirm("Close GrowingApp?"))
                navigator.app.exitApp();
        }
        else if (currentPage === "insights"){
            window.location.hash = "/";
        }
    }

    return {
        mainMenuItems: mainMenuItems
    };
}]);