define(["angular", "services/phonegap", "services/messages", "classes/file_data", "modules/dialogs/dialogs"], function(angular){
    images.$inject = ["$q", "phonegap", "messages", "FileData", "dialogs"];

    return angular.module("Images", ["Phonegap", "Messages", "FileData", "Dialogs"]).factory("images", images);

    function images($q, phonegap, messages, FileData, dialogs){

        var THUMBNAIL_SIZE = 100;

        return {
            addPhotoToDataObject: addPhotoToDataObject,
            addThumbnailToDataObject: addThumbnailToDataObject,
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
         * Given a dataObject, tries to add a thumbnail to its image.
         * @param dataObject
         * @returns {*}
         */
        function addThumbnailToDataObject(image){
            return getImageThumbnail(image.localUrl, image.mimeType).then(function (base64) {
                return phonegap.files.saveBase64ToFile(base64, "thumbnails", "thumbnail_" + new Date().valueOf(), image.mimeType).then(function (file) {
                    image.localThumbnailUrl = file.url;
                    image.unsaved = true;
                    image.unsynced = true;
                    return image;
                });
            });
        }

        /**
         * Displays a modal with selection for the image retrieval method - browse or camera,
         * returns a promise that resolves with the result.
         */
        function selectImageMethod(){
            var deferred = $q.defer();

            dialogs.imageMethodSelect.select = function(method){
                dialogs.imageMethodSelect.close();
                deferred.resolve(method);
            };

            dialogs.imageMethodSelect.open();

            dialogs.imageMethodSelect.onClose.subscribe(onCloseDialog);

            function onCloseDialog(){
                delete dialogs.imageMethodSelect.select;
                dialogs.imageMethodSelect.onClose.unsubscribe(onCloseDialog);
            }
            return deferred.promise;
        }

        /**
         * Takes a picture and if successful, adds it to the DataObject.
         * Also creates a thumbnail for the image.
         * @param method "camera" / "browse". Defaults to "camera" if none.
         * @returns {*} The promise is called with the new image
         */
        function addPhotoToDataObject(imagesConfig, dataObject, method) {
            if (!method)
                return selectImageMethod().then(doGetPhoto);
            else
                return doGetPhoto(method);

            function doGetPhoto(method) {
                return getPhoto(method, {
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

                    return addThumbnailToDataObject(dataObject.image);
                }, function (error) {
                    //messages.error(error);
                });
            }
        }
    }
});