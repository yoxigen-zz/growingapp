angular.module("Images", ["Phonegap", "Messages", "FileData"]).factory("images", ["$q", "phonegap", "messages", "FileData", function($q, phonegap, messages, FileData){

    var THUMBNAIL_SIZE = 160;

	return {
        addPhotoToDataObject: addPhotoToDataObject,
		browsePhotos: browsePhotos,
        getImageThumbnail: getImageThumbnail,
		getPhoto: getPhoto,
		takePhoto: takePhoto
	};

    /**
     * Given an image URL, returns the Base64 data of a THUMBNAIL_SIZE x THUMBNAIL_SIZE sized thumbnail of the image.
     * @param imageUrl
     * @returns {promise|dd.g.promise}
     */
    function getImageThumbnail(imageUrl, mimeType){
        var image = new Image(),
            deferred = $q.defer();

        /// when image is loaded:
        image.onload = onLoad;

        image.onerror = function(error){
            deferred.reject(error);
        };

        image.src = imageUrl;

        if (image.loaded)
            onLoad();

        return deferred.promise;

        function onLoad() {
            try {
                var canvas = document.createElement('canvas'),
                    ctx = canvas.getContext('2d'),
                    fillSize = getFillSize(image.width, image.height, THUMBNAIL_SIZE, THUMBNAIL_SIZE);

                canvas.width = THUMBNAIL_SIZE;
                canvas.height = THUMBNAIL_SIZE;

                ctx.drawImage(image, fillSize.left, fillSize.top, fillSize.width, fillSize.height);
                deferred.resolve(canvas.toDataURL(mimeType.id));
            }
            catch(e){
                deferred.reject(e);
            }
        }

    }

    function getFillSize(sWidth, sHeight, tWidth, tHeight){
        var width = tWidth,
            sRatio = sWidth / sHeight,
            height = width / sRatio;

        if (height < tHeight){
            height = tHeight;
            width = height * sRatio;
        }

        var left = (tWidth - width) / 2,
            top = (tHeight - height) / 2;

        return { width: width, height: height, left: left, top: top };
    }

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
     * Also creates a thumbnail for the image.
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
            return getImageThumbnail(imageUrl, FileData.mimeTypes.image.JPEG).then(function (base64) {
                return phonegap.files.saveBase64ToFile(base64, "thumbnails", "thumbnail_" + new Date().valueOf(), FileData.mimeTypes.image.JPEG).then(function (file) {
                    dataObject.image = new FileData({
                        localUrl: imageUrl,
                        localThumbnailUrl: file.url,
                        mimeType: FileData.mimeTypes.image.JPEG,
                        unsaved: true,
                        unsynced: true
                    });

                    return dataObject.image;
                });
            });
        }, function(error){
            messages.error(error);
        });
    }
}]);