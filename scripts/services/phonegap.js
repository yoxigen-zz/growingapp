'use strict';

angular.module("Phonegap", []).factory("phonegap", ["$q", function($q){
    var defaultCameraOptions,
        deviceReady,
        onDeviceReady;

    document.addEventListener("deviceready",function(){
        deviceReady = true;

        try {
            defaultCameraOptions = {
                quality: 75,
                destinationType: Camera.DestinationType.FILE_URI, // Also FILE_URI
                encodingType: Camera.EncodingType.JPEG
            };
        }
        catch(e) {
            alert("Can't initialize camera.");
        }

        if (onDeviceReady){
            onDeviceReady.forEach(function(callback){
                callback();
            });
        }
    },false);

    function runOnDeviceReady(callback){
        if (deviceReady)
            callback();
        else {
            if (!onDeviceReady)
                onDeviceReady = [];

            onDeviceReady.push(callback);
        }
    }

    var methods = {
        onBackButton: {
            addEventListener: function(eventHandler){
                runOnDeviceReady(function(){
                    document.addEventListener("backbutton", function () {
                        eventHandler();
                    }, false);
                });
            }
        },
        files: {
            upload: function(fileUrl, serverUrl, options){
                var ft = new FileTransfer(),
                    ftOptions = new FileUploadOptions(),
                    deferred = $q.defer();

                ftOptions.fileKey = "file";
                ftOptions.fileName = options.fileName;
                ftOptions.mimeType = options.mimeType;
                if (options.headers)
                    ftOptions.headers = options.headers;

                if (options.params)
                    ftOptions.params = options.params;

                ftOptions.chunkedMode = false;

                ft.upload(fileUrl, serverUrl, function(e){
                    alert("upload success: " + JSON.stringify(e));
                    deferred.resolve(e);
                }, function(error){
                    alert("upload FAILED: " + JSON.stringify(error));
                    deferred.reject(error);
                }, ftOptions);

                return deferred.promise;
            }
        },
        images: {
            browsePhotos: function(options){
                var deferred = $q.defer();
                try {
                    navigator.camera.getPicture(
                        function onSuccess(result) {
                            deferred.resolve(result);
                        },
                        function onError(error) {
                            deferred.reject(error);
                        },
                        angular.extend({}, defaultCameraOptions, options, { sourceType : Camera.PictureSourceType.PHOTOLIBRARY })
                    );
                }
                catch (error) {
                    deferred.reject(error);
                }

                return deferred.promise;
            },
            takePhoto: function (options) {
                var deferred = $q.defer();
                try {
                    if (!window.Camera)
                        alert("Camera unavailable.");

                    else if (navigator.camera) {
                        navigator.camera.getPicture(
                            function onSuccess(result) {
                                deferred.resolve(result);
                            },
                            function onError(error) {
                                deferred.reject(error);
                            },
                            angular.extend({}, defaultCameraOptions, options, {sourceType: Camera.PictureSourceType.CAMERA})
                        );
                    }
                }
                catch (error) {
                    deferred.reject(error);
                }

                return deferred.promise;
            }
        }
    };

    return methods;
}]);