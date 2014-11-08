app.factory("navigation", ["phonegap", "eventBus", "$route", "$rootScope", "users", function(phonegap, eventBus, $route, $rootScope, users){
    var openPopups = [],
        mainMenuItems = [
            { text: "Settings", icon: "images/icons/settings.svg", onClick: function(e){
                e.preventDefault();
                eventBus.triggerEvent("showSettings");
            } },
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
    eventBus.subscribe("popup.open", function(popup){
        openPopups.push(popup);
    });
    eventBus.subscribe("popup.close", function(popup){
        openPopups.pop();
    });

    function onBackButton(){
        $rootScope.safeApply(function(){
            if (openPopups.length)
                openPopups[openPopups.length - 1].closeDialog();
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