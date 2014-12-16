'use strict';

angular.module("FileData", ["Config", "DataObject"]).factory("FileData", ["dbConfig", "DataObject", function(dbConfig, DataObject){
    function FileData(imageData){
        var id;

        if (imageData){
            for(var p in imageData){
                if (imageData.hasOwnProperty(p))
                    this[p] = imageData[p];
            }
        }

        if (!this.id)
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
    }

    FileData.mimeTypes = {
        image: {
            GIF: "image/gif",
            JPEG: "image/jpeg",
            PNG: "image/png"
        }
    };

    FileData.prototype.__proto__ = new DataObject();

    FileData.prototype.__defineGetter__("url", function(){
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

        return {
            id: this.id,
            cloudUrl: this.cloudUrl
        }
    };

    FileData.prototype.getLocalData = function(){
        var localData = {};

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

    return FileData;
}]);