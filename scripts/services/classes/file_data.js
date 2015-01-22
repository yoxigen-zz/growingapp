(function(){
    'use strict';

    angular.module("FileData", ["Config", "DataObject", "Phonegap", "Images"]).factory("FileData", FileDataClass);

    FileDataClass.$inject = ["$q", "dbConfig", "DataObject", "$indexedDB", "phonegap"];

    function FileDataClass($q, dbConfig, DataObject, $indexedDB, phonegap) {
        var objectStore = $indexedDB.objectStore(dbConfig.objectStores.files.name);

        function FileData(fileConfig) {
            var id;
            this.setData = setData;

            if (fileConfig)
                this.setData(fileConfig);

            this.__defineSetter__("id", function (value) {
                if (value) {
                    if (!id)
                        id = value;
                    else if (value !== id)
                        throw new Error("Can't set change a FileData's ID once it's set.");
                }
            });

            this.__defineGetter__("id", function () {
                return id;
            });


            /**
             * Sets the properties of the fileData from an object
             * @param fileData
             */
            function setData(fileData) {
                if (Object(fileData) === fileData) {
                    for (var p in fileData) {
                        if (fileData.hasOwnProperty(p)) {
                            switch (p) {
                                case "id":
                                case "fileId":
                                    if (id && fileData[p] !== id)
                                        throw new Error("Can't change ID for a FileData object.");

                                    id = fileData[p];
                                    break;
                                case "file":
                                    this.cloudUrl = fileData[p].url();
                                case "thumbnail":
                                    this.cloudThumbnailUrl = fileData[p].url();
                                case "file":
                                case "thumbnail":
                                    this.requireDownload = true;
                                    break;
                                default:
                                    this[p] = fileData[p];
                            }
                        }
                    }

                    if (this.localUrl === undefined) {
                        this.localUrl = null;
                        this.localThumbnailUrl = null;
                    }
                }
                else if (typeof(fileData) === "string") {
                    id = fileData;
                    this.fillData(id);
                }
                else
                    throw new Error("Invalid data for FileData, must be either object or string representing the FileData's ID.");
            }
        }

        FileData.mimeTypes = {
            image: {
                GIF: { id: "image/gif", name: "GIF", extension: "gif" },
                JPEG: { id: "image/jpeg", name: "JPEG", extension: "jpg" },
                PNG: { id: "image/png", name: "PNG", extension: "png" }
            }
        };

        FileData.prototype.__proto__ = DataObject;
        FileData.prototype.objectStore = objectStore;
        FileData.prototype.idProperty = "id";

        /**
         * Generates an ID for the FileData. If it already has one, an error is thrown.
         */
        FileData.prototype.getNewId = function () {
            return "file_" + new Date().valueOf();
        };

        FileData.prototype.fillData = function (id) {
            if (!id)
                id = this.id;

            if (!id)
                throw new Error("Can't fill FileData object's data, it has no ID.");

            var self = this;
            return FileData.getById(id).then(function (fileDataObj) {
                if (fileDataObj)
                    self.setData(fileDataObj);
            });
        };

        FileData.prototype.__defineGetter__("url", function () {
            return this.localUrl || this.cloudUrl;
        });

        FileData.prototype.__defineGetter__("thumbnailUrl", function(){
            return this.localThumbnailUrl || this.cloudThumbnailUrl;
        });

        FileData.prototype.setLocalUrl = function (value) {
            this.localUrl = value;
            delete this.requireDownload;
        };

        FileData.prototype.getCloudData = function () {
            if (!this.id)
                throw new Error("Can't get cloud data for image, since it has no ID.");

            if (!this.mimeType)
                throw new Error("Can't get FileData cloudData, mimeType is missing.");

            var cloudData = {
                fileId: this.id,
                mimeType: this.mimeType.id,
                id: this.cloudId
            };

            if (this.localUrl) {
                var getFilePromise = phonegap.files.getFileByUrl(this.localUrl).then(function (file) {
                    cloudData.file = file;
                });

                var promises = [getFilePromise];

                if (this.localThumbnailUrl){
                    alert("get thumbnail file " + this.localThumbnailUrl);
                    promises.push(phonegap.files.getFileByUrl(this.localThumbnailUrl).then(function (file) {
                        alert("file " + JSON.stringify(file))
                        cloudData.thumbnail = file;
                    }));
                }

                return $q.all(promises).then(function(){
                    return cloudData;
                });
            }

            return cloudData;
        };

        FileData.prototype.getLocalData = function () {
            var localData = {
                id: this.id
            };

            if (!this.mimeType)
                throw new Error("Can't save FileData locally, mimeType is missing.");

            localData.mimeType = this.mimeType;

            if (this.unsynced)
                localData.unsynced = 1;

            if (this.localUrl) {
                localData.localUrl = this.localUrl;
                localData.localUrlDate = this.localUrlDate;
            }

            if (this.localThumbnailUrl)
                localData.localThumbnailUrl = this.localThumbnailUrl;

            if (this.cloudUrl)
                localData.cloudUrl = this.cloudUrl;

            if (this.cloudThumbnailUrl)
                localData.cloudThumbnailUrl = this.cloudThumbnailUrl;

            if (this.requireDownload)
                localData.requireDownload = 1;

            return localData;
        };

        FileData.getAll = function (options) {
            options = options || {};
            var DataObjectType = FileData;

            return objectStore.internalObjectStore(dbConfig.objectStores.files.name, "readonly").then(function (objectStore) {
                var idx = objectStore.index(options.unsynced ? "unsync_idx" : "id_idx");
                var items = [],
                    count = options.count || null,
                    currentRecord = 0,
                    deferred = $q.defer(),
                    cursor = idx.openCursor(null);

                cursor.onsuccess = function (event) {
                    var cursor = event.target.result;
                    if (!cursor || count && currentRecord === count) {
                        deferred.resolve(items);
                        return;
                    }

                    if (options.offset && currentRecord < options.offset) {
                        currentRecord = options.offset;
                        cursor.advance(options.offset);
                    }
                    else {
                        if (!cursor.value.deleted || options.includeDeleted) {
                            items.push(new DataObjectType(cursor.value));
                            currentRecord++;
                        }
                        cursor.continue();
                    }
                };

                cursor.onerror = function (event) {
                    deferred.reject(event);
                };

                return deferred.promise;
            }, function () {
                return $q.when([]);
            });
        };

        FileData.getById = function (fileId) {
            return objectStore.find(fileId).then(function (objData) {
                if (objData)
                    return new FileData(objData);

                return null;
            });
        };

        FileData.syncFiles = true;

        return FileData;
    }
})();