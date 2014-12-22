'use strict';

angular.module("FileData", ["Config", "DataObject", "Phonegap"]).factory("FileData", ["$q", "dbConfig", "DataObject", "$indexedDB", "phonegap", function($q, dbConfig, DataObject, $indexedDB, phonegap){
    var objectStore = $indexedDB.objectStore(dbConfig.objectStores.files.name);

    function FileData(fileConfig){
        var id;

        this.setData = setData;

        if (fileConfig)
            this.setData(fileConfig);

        if (!id)
            id = "IMG_" + new Date().valueOf();

        this.__defineSetter__("id", function(value){
            if (value) {
                if (!id)
                    id = value;
                else
                    throw new Error("Can't set ID twice to an image.");
            }
        });

        this.__defineGetter__("id", function(){
            return id;
        });


        /**
         * Sets the properties of the fileData from an object
         * @param fileData
         */
        function setData(fileData){
            if (Object(fileData) === fileData) {
                for (var p in fileData) {
                    if (p === "id" || p === "fileId") {
                        if (id && fileData[p] !== id)
                            throw new Error("Can't change ID for a FileData object.");

                        id = fileData[p];
                    }
                    else if (p === "file") {
                        this.cloudUrl = fileData[p].url();
                        this.requireDownload = true;
                    }
                    else if (fileData.hasOwnProperty(p))
                        this[p] = fileData[p];
                }
            }
            else if (typeof(fileData) === "string")
                id = fileData;
            else
                throw new Error("Invalid data for FileData, must be either object or string.");
        }
    }

    FileData.mimeTypes = {
        image: {
            GIF: "image/gif",
            JPEG: "image/jpeg",
            PNG: "image/png"
        }
    };

    FileData.prototype.__proto__ = new DataObject();
    FileData.prototype.objectStore = objectStore;

    FileData.prototype.fillData = function(){
        if (!this.id)
            throw new Error("Can't fill FileData object's data, it has no ID.");

        var self = this;
        return FileData.getById(this.id).then(function(fileDataObj){
             self.setData(fileDataObj);
        });
    };

    FileData.prototype.__defineGetter__("url", function(){
        if (this.__loading__)
            return this.__loading__;

        if (!this.id)
            return null;

        if (this.id && !this.localUrl){
            var self = this;
            var promise = this.fillData().then(function(){
                return self.localUrl || self.cloudUrl;
            }).finally(function(){
                delete this.__loading__;
            });

            this.__loading__ = promise;
            return promise;
        }

        return this.localUrl || this.cloudUrl;
    });

    FileData.prototype.setLocalUrl = function(value){
        this.localUrl = value;
        this.localUrlDate = new Date();
        delete this.requireDownload;
    };

    FileData.prototype.setCloudUrl = function(cloudUrl, cloudUrlUpdateDate){
        if (this.localUrl && this.localUrlDate > cloudUrlUpdateDate)
            return false;

        this.cloudUrl = cloudUrl;
        this.requireDownload = true;
    };

    FileData.prototype.getCloudData = function(){
        if (!this.id)
            throw new Error("Can't get cloud data for image, since it has no ID.");

        if (!this.mimeType)
            throw new Error("Can't get FileData cloudData, mimeType is missing.");

        var cloudData = {
            fileId: this.id,
            mimeType: this.mimeType,
            id: this.cloudId
        };

        if (this.localUrl) {
            return phonegap.files.getFileByUrl(this.localUrl).then(function (file) {
                cloudData.file = file;
                return cloudData;
            });
        }

        return cloudData;
    };

    FileData.prototype.getLocalData = function(){
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

        if (this.cloudUrl)
            localData.cloudUrl = this.cloudUrl;

        if (this.requireDownload)
            localData.requireDownload = 1;

        return localData;
    };

    FileData.getAll = function (options) {
        options = options || {};
        var DataObjectType = FileData;

        return objectStore.internalObjectStore(dbConfig.objectStores.files.name, "readonly").then(function(objectStore){
            var idx = objectStore.index(options.unsynced ? "unsync_idx" : "id_idx");
            var items = [],
                count = options.count || null,
                currentRecord = 0,
                deferred = $q.defer(),
                cursor = idx.openCursor(null);

            cursor.onsuccess = function(event) {
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
                    if(!cursor.value.deleted || options.includeDeleted) {
                        items.push(new DataObjectType(cursor.value));
                        currentRecord++;
                    }
                    cursor.continue();
                }
            };

            cursor.onerror = function(event){
                deferred.reject(event);
            };

            return deferred.promise;
        }, function(){
            return $q.when([]);
        });
    };

    FileData.getById = function(fileId){
        return objectStore.find(fileId).then(function(objData){
             return new FileData(objData);
        });
    };

    return FileData;
}]);