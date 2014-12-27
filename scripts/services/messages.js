angular.module("Messages", []).factory("messages", ["$q", function($q){
	return {
		confirm: confirm,
		error: error
	};

	function confirm(message){
		return $q.when(window.confirm(message));
	}

	function error(message, error){
        if (window.cordova) {
            if (typeof(message) === "object")
                alert(JSON.stringify(message));
            else{
                var message = message;
                if (error)
                    message += " " + JSON.stringify(error);

                alert(message);
            }
        }
        if (error)
            console.error(message, error);
        else
            console.error(message);
	}
}]);