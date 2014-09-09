'use strict';

angular.module("Phonegap", []).factory("phonegap", ["$q", function($q){
    var defaultCameraOptions;
    document.addEventListener("deviceready",function(){
        defaultCameraOptions = {
            quality : 75,
            destinationType : Camera.DestinationType.FILE_URI,
            sourceType : Camera.PictureSourceType.CAMERA,
            encodingType: Camera.EncodingType.JPEG
        };
    },false);

    var methods = {
        images: {
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
                        angular.extend({}, defaultCameraOptions, options)
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