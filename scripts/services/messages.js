define(["angular"], function(angular){
    return angular.module("Messages", []).factory("messages", ["$q", function($q){
        return {
            confirm: confirm,
            error: log.bind(this, "error"),
            log: log.bind(this, "log")
        };

        function confirm(message){
            return $q.when(window.confirm(message));
        }

        function log(type, message, obj){
            if (window.cordova) {
                if (typeof(message) === "object")
                    alert(JSON.stringify(message));
                else{
                    var message = message;
                    if (obj)
                        message += " " + JSON.stringify(obj);

                    alert(message);
                }
            }
            if (obj)
                console[type](message, obj);
            else
                console[type](message);
        }
    }]);
});