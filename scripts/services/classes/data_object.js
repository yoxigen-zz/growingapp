"use strict";

app.factory("DataObject", ["$q", "$indexedDB", "images", "parse", function getDataObjectClassFactory($q, $indexedDB, images, parse) {
    function DataObject(){}

    DataObject.prototype = {
        /**
         * Uses the images service to take a picture and if successful, add it to the player.
         * @param method "camera" / "browse". Defaults to "camera" if none.
         * @returns {*} The promise is called with the new image
         */
        addPhoto: function(method){
            var dataObj = this;
            return images.getPhoto(method, {
                allowEdit : true,
                targetWidth: this.imagesConfig.width,
                targetHeight: this.imagesConfig.height,
                saveToPhotoAlbum: false
            }).then(function(imageUrl){
                dataObj.localImageUrl = dataObj.image = imageUrl;
                return imageUrl;
            });
        },
        remove: function (absoluteDelete) {
            var self = this;

            if (!this[this.idProperty])
                throw new Error("Can't delete " + this.constructor.name + " - it hasn't been saved yet.");

            if (absoluteDelete){
                return this.objectStore.delete(this[this.idProperty]).catch(function(error){
                    console.error("Can't delete " + self.constructor.name + ": ", error);
                    return $q.reject("Can't delete " + self.constructor.name);
                });
            }
            else {
                this._deleted = true;
                this.save();
                return $q.when(this)
            }
        },
        save: function(isSynced){
            if (this.validate) {
                try {
                    this.validate();
                }
                catch(error){
                    return $q.reject(error);
                }
            }

            var self = this,
                objectId = this[this.idProperty];

            if (!objectId) {
                this.isNew = true;
                if (this.getNewId)
                    this[this.idProperty] = this.getNewId();

                return doSave();
            }
            else {
                return this.objectStore.find(objectId).then(function(existingEntry){
                    self.isNew = !existingEntry;

                    // The entry is deleted and the changed has been synced to cloud, can proceed to completely delete:
                    if (self._deleted && isSynced) {
                        self.isNew = false;
                        return existingEntry ? self.remove(true) : self;
                    }

                    return doSave();
                });
            }

            function doSave() {
                return saveImage().then(function(){
                    if (self.preSave)
                        return $q.when(self.preSave()).then(saveToLocalDB);

                    return saveToLocalDB();
                });
            }

            function saveToLocalDB(){
                try {
                    var localData = self.getLocalData();
                    if (!isSynced)
                        localData.unsynced = 1;

                    if (self._deleted)
                        localData.unsynced = localData.deleted = 1;

                    return self.objectStore.upsert(localData).then(function (id) {
                        self[self.idProperty] = id;
                        return self;
                    }, function (error) {
                        alert("ERROR: " + JSON.stringify(error));
                    });
                }
                catch(e){
                    return $q.reject("Error saving object.");
                }
            }

            function saveImage(){
                if (self.localImageUrl){
                    return parse.uploadFile(self.localImageUrl, self.name + ".jpg", "image/jpeg").then(function(file){
                        self.image = self.localImageUrl;
                        self.imageUrl = file.url();
                        delete self.localImageUrl;
                    }, function(error){
                        alert("Can't upload image file: " + error);
                    });
                }
                else
                    return $q.when();
            }
        },
        unremove: function(){
            if (!this._deleted)
                return false;

            this._deleted = false;
            this.save();
        }
    };

    return DataObject;
}]);