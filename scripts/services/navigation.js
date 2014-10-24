app.factory("navigation", ["eventBus", "$route", function(eventBus, $route){
    document.addEventListener("deviceready",function(){
        document.addEventListener("backbutton", onBackKeyDown, false);
    });

    function onBackKeyDown(){
        alert("BACK");
    }
}]);