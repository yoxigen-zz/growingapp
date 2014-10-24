'use strict';

angular.module("Phonegap", ["EventBus"]).factory("phonegap", ["$q", function($q, eventBus){
    var defaultCameraOptions,
        deviceReady;

    document.addEventListener("deviceready",function(){
        deviceReady = true;

        try {
            defaultCameraOptions = {
                quality: 75,
                destinationType: Camera.DestinationType.FILE_URI,
                encodingType: Camera.EncodingType.JPEG
            };
        }
        catch(e) {
            alert("Can't initialize camera.");
        }

        alert("adding back");
        document.addEventListener("backbutton", function () {
            if (confirm("Are you sure you want to back?"))
                alert("YO");

        }, false);
    },false);

    function onBackKey(){

    }

    var methods = {
        onBackButton: function(){
            //if (deviceReady)

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