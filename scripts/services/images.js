angular.module("Images", ["Phonegap", "Messages"]).factory("images", ["$q", "phonegap", "messages", function($q, phonegap, messages){
	return {
		browsePhotos: browsePhotos,
		getPhoto: getPhoto,
		takePhoto: takePhoto
	};

	function getPhoto(method, options){
		if (method && method === "browse")
			return browsePhotos(options);
		else
			return takePhoto(options);
	}

	function takePhoto(options){
		return phonegap.images.takePhoto(options).catch(function(error){
			var friendlyMessage = "Can't take photo";
			messages.error(friendlyMessage);
			return $q.reject(friendlyMessage);
		});
	}

	function browsePhotos(options){
		return phonegap.images.browsePhotos(options);
	}
}]);