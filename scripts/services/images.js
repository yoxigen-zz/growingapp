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
        /*
        dataObject.image = new FileData({ mimeType: FileData.mimeTypes.image.JPEG });

        dataObject.image.setLocalUrl("./test.jpg");
        dataObject.unsynced = 1;
        dataObject.image.unsaved = true;

        return $q.when(dataObject.image);
*/
        return getPhoto(method, {
            allowEdit: true,
            targetWidth: imagesConfig.width,
            targetHeight: imagesConfig.height,
            saveToPhotoAlbum: false
        }).then(function (imageUrl) {
            if (!dataObject.image)
                dataObject.image = new FileData({ mimeType: FileData.mimeTypes.image.JPEG });

            dataObject.image.setLocalUrl(imageUrl);
            dataObject.unsynced = 1;
            dataObject.image.unsaved = true;
            return dataObject.image;
        });
    }
}]);