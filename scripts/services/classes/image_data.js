'use strict';

app.factory("ImageData", [function(){
    function ImageData(imageData){
        if (imageData){
            for(var p in imageData){
                if (imageData.hasOwnProperty(p))
                    this[p] = imageData[p];
            }
        }
    }

    ImageData.prototype.__defineGetter__("url", function(){
        return this.localUrl || this.cloudUrl;
    });

    ImageData.prototype.setLocalUrl = function(value){
        this.localUrl = value;
        this.localUrlDate = new Date();
        delete this.requireDownload;
    };

    ImageData.prototype.setCloudUrl = function(cloudUrl, cloudUrlUpdateDate){
        if (this.localUrl && this.localUrlDate > cloudUrlUpdateDate)
            return false;

        this.cloudUrl = cloudUrl;
        this.requireDownload = true;
    };

    ImageData.prototype.getLocalData = function(){
        var localData = {};

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

    return ImageData;
}]);