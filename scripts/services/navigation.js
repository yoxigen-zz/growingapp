app.factory("navigation", ["phonegap", "eventBus", "$route", "$rootScope", function(phonegap, eventBus, $route, $rootScope){
    var openPopup;
    phonegap.onBackButton.addEventListener(onBackButton);

    function onBackButton(){
        $rootScope.safeApply(function(){
            if (openPopup)
                openPopup.closePopup();
            else
                navigateUp();
        });
    }

    window.backup = onBackButton;

    eventBus.subscribe("popup.open", function(popup){
        openPopup = popup;
    });

    eventBus.subscribe("popup.close", function(){
        openPopup = null;
    });

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

    };
}]);