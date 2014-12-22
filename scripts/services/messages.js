angular.module("Messages", []).factory("messages", ["$q", function($q){
	return {
		confirm: confirm,
		error: error
	};

	function confirm(message){
		return $q.when(window.confirm(message));
	}

	function error(message){
		alert(message);
        console.error(message);
	}
}]);