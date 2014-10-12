"use strict";

app.factory("DataObject", ["$q", "$indexedDB", function getDataObjectClassFactory($q, $indexedDB) {
    function DataObject(){}
    DataObject.prototype = {
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
                    console.error("Error saving object: ", e);
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