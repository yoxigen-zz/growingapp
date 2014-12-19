'use strict';

angular.module("Phonegap", []).factory("phonegap", ["$q", function($q){
    var defaultCameraOptions,
        deviceReady,
        onDeviceReady,
        fileSystem;

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

        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs){
            fileSystem = fs;
        }, function(error){
            alert("Can't get file system: " + JSON.stringify(error));
        });

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
            getFileByUrl: function(fileUrl){
                var resolveUrl = window.resolveLocalFileSystemURL;

                if (!resolveUrl){
                    return $q.reject("Can't get file, window.resolveLocalFileSystemURL is unavailable");
                }

                var deferred = $q.defer();

                resolveUrl(fileUrl, function(entry){
                    entry.file(function(file){
                        deferred.resolve(file);
                    }, function(error){
                        deferred.reject(error);
                    });
                }, function(error){
                    deferred.reject(error);
                });

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