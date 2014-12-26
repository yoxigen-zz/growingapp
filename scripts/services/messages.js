angular.module("Messages", []).factory("messages", ["$q", function($q){
	return {
		confirm: confirm,
		error: error
	};

	function confirm(message){
		return $q.when(window.confirm(message));
	}

	function error(message, error){
        if (window.cordova)
		    alert(typeof(message) === "object" ? JSON.stringify(message) : message);

        if (error)
            console.error(message, error);
        else
            console.error(message);
	}
}]);