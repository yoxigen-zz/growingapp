app.factory("navigation", ["eventBus", "$route", function(eventBus, $route){
    document.addEventListener("deviceready",function(){
        alert("ready");
        document.addEventListener("backbutton", onBackKeyDown, false);
    });

    function onBackKeyDown(){
        alert("BACK");
    }
}]);