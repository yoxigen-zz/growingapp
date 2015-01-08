"use strict";

angular.module("DataObject", ["xc.indexedDB", "Parse"]).factory("DataObject", ["$q", function getDataObjectClassFactory($q) {
    /**
     * Base class for data objects - those that should be saved to local DB (and potentially synced to cloud)
     * Includes methods for saving, deleting and initializing
     * @constructor
     */
    function DataObject(){}

    DataObject.prototype = {
        getBaseCloudData: function(){
            return {
                deleted: !!this._deleted,
                imageId: this.image && this.image.id
            };
        },
        getBaseLocalData: function(){
            return {
                imageId: this.image && this.image.id,
                cloudId: this.cloudId
            };
        },
        /**
         * To be used by child classes when the instance is created
         * @param data
         */
        init: function(data){
            if (!data || !angular.isObject(data))
                return;

            if (data.deleted)
                this._deleted = data.deleted;

            if (data.cloudId)
                this.cloudId = data.cloudId;

            if (data.image)
                this.image = data.image;
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

                // TODO: Delete image if exists
            }
            else {
                this._deleted = true;
                this.save();
                return $q.when(this)
            }
        },
        /**
         * Saves the data object locally, to IndexedDB, or updates the item if exists.
         * @param isSynced If true, the object is considered synced, otherwise it'll have unsynced = true after save (meaning that it should be synced to cloud when possible).
         * @returns {*}
         */
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
                if (self.preSave)
                    return $q.when(self.preSave()).then(saveImage);

                return saveImage();
            }

            function saveImage(){
                if (self.image && self.image.unsaved)
                    return self.image.save().then(saveToLocalDB);
                else
                    return saveToLocalDB();
            }

            function saveToLocalDB(){
                try {
                    var localData = self.getLocalData();
                    if (!isSynced)
                        localData.unsynced = 1;

                    if (self._deleted)
                        localData.unsynced = localData.deleted = 1;

                    if (!self.objectStore)
                        throw new Error("Objectstore for DataObject of type " + self.constructor.name + " not defined.");

                    return self.objectStore.upsert(localData).then(function (id) {
                        self[self.idProperty] = id;
                        return self;
                    }, function (error) {
                        alert("ERROR: " + JSON.stringify(error));
                    });
                }
                catch(e){
                    return $q.reject("Error saving object: " + e.message);
                }
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