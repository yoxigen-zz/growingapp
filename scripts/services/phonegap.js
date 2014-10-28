'use strict';

angular.module("Phonegap", []).factory("phonegap", ["$q", function($q){
    var defaultCameraOptions,
        deviceReady,
        onDeviceReady;

    document.addEventListener("deviceready",function(){
        deviceReady = true;

        setTimeout(function(){
            try {
                defaultCameraOptions = {
                    quality: 75,
                    destinationType: Camera.DestinationType.DATA_URL, // Also FILE_URI
                    encodingType: Camera.EncodingType.JPEG
                };
            }
            catch(e) {
                alert("Can't initialize camera.");
            }
        }, 500);

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
                    navigator.camera.getPicture(
                        function onSuccess(result) {
                            deferred.resolve(result);
                        },
                        function onError(error) {
                            deferred.reject(error);
                        },
                        angular.extend({}, defaultCameraOptions, options, { sourceType : Camera.PictureSourceType.CAMERA })
                    );
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