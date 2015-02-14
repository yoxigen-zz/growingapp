define(["angular", "components/base64-binary"], function(angular, Base64Binary){
    'use strict';

    return angular.module("Phonegap", []).factory("phonegap", ["$q", "$rootScope", function($q, $rootScope){
        var defaultCameraOptions,
            deviceReady,
            onDeviceReady,
            fileSystem,
            version = { value: "?" };

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

            if (typeof(cordova.getAppVersion) !== "undefined") {
                cordova.getAppVersion(function (version) {
                    version.value = version;
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
            app: {
                version: version
            },
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
                /**
                 * Downloads a file, given an URL and the local path to save it to.
                 * @param url The URL of the file to download. Should NOT be encoded with encodeURI.
                 * @param localPath The full path to save the file into.
                 * @returns {promise|dd.g.promise} The promise resolves with a FileEntry object.
                 */
                download: function(url, folder, filename){
                    if (typeof(FileTransfer) === "undefined")
                        return $q.reject("Can't download file, FileTransfer not available.");

                    var fileTransfer = new FileTransfer(),
                        deferred = $q.defer();

                    var rootDir = fileSystem.root; // to get root path of directory
                    rootDir.getDirectory(folder, { create: true, exclusive: false }, function(fileDir){
                        var downloadPath = fileDir.nativeURL + filename;
                        fileTransfer.download(encodeURI(url), downloadPath,
                            function (entry) {
                                $rootScope.$apply(function() {
                                    deferred.resolve(entry);
                                });
                            },
                            function (error) {
                                $rootScope.$apply(function() {
                                    deferred.reject(error);
                                });
                            }
                        );
                    }, function(error){
                        deferred.reject(error);
                    });

                    return deferred.promise;
                },
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
                },
                saveBase64ToFile: function(base64, folder, fileName, mimeType){
                    var deferred = $q.defer();

                    var rootDir = fileSystem.root; // to get root path of directory

                    rootDir.getDirectory(folder, { create: true, exclusive: false }, function(fileDir){
                        try {
                            var filePath = fileName + "." + mimeType.extension;
                            fileDir.getFile(filePath, {create: true, exclusive: false}, gotFileEntry, deferred.reject);
                        }
                        catch(e){
                            alert(e);
                        }

                        function gotFileEntry(fileEntry) {
                            fileEntry.createWriter(function(writer){
                                writer.seek(0);

                                try {
                                    writer.write(Base64Binary.decodeArrayBuffer(base64.replace(/^data:image\/\w+;base64,/, "")));
                                }
                                catch(e){
                                    alert("CAN'T WRITE: ");
                                }
                                deferred.resolve({ url: fileEntry.nativeURL, file: fileEntry });
                            }, deferred.reject);
                        }
                    }, deferred.reject);

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
});