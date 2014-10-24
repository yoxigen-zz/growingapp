app.factory("navigation", ["phonegap", "eventBus", "$route", function(phonegap, eventBus, $route){
    phonegap.onBackButton.addEventListener(function(){
        alert("it works");
    });

    return {

    };
}]);