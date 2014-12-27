angular.module("Images", ["Phonegap", "Messages", "FileData"]).factory("images", ["$q", "phonegap", "messages", "FileData", function($q, phonegap, messages, FileData){
	return {
        addPhotoToDataObject: addPhotoToDataObject,
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

    /**
     * Takes a picture and if successful, adds it to the DataObject.
     * @param method "camera" / "browse". Defaults to "camera" if none.
     * @returns {*} The promise is called with the new image
     */
     function addPhotoToDataObject(imagesConfig, dataObject, method) {
        return getPhoto(method, {
            allowEdit: true,
            targetWidth: imagesConfig.width,
            targetHeight: imagesConfig.height,
            saveToPhotoAlbum: false
        }).then(function (imageUrl) {
            dataObject.image = new FileData({
                localUrl: imageUrl,
                mimeType: FileData.mimeTypes.image.JPEG,
                unsaved: true,
                unsynced: true
            });

            return dataObject.image;
        });
    }
}]);