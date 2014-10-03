"use strict";

app.factory("Entry", ["$q", "$indexedDB", "entries", "Player", function getEntryClassFactory($q, $indexedDB, entries, Player) {
    var OBJECT_STORE_NAME = "entries",
        entriesObjectStore = $indexedDB.objectStore(OBJECT_STORE_NAME);

    function Entry(type, player) {
        var timestamp;

        if (type.timestamp && type.playerId && type.properties)
        {
            var entryData = type;
            type = entries.types[entryData.type];

            timestamp = entryData.timestamp;
            this.date = entryData.date;
            this.age = entryData.age;
            this.properties = entryData.properties;
            this.player = Player.getById(entryData.playerId);
            this.description = entryData.description;

            if (entryData.deleted)
                this._deleted = entryData.deleted;

            if (entryData.cloudId)
                this.cloudId = entryData.cloudId;

            this.isNewEntry = false;
        }
        else{
            this.date = new Date();
            this.properties = {};
            this.player = player;
            this.age = player.getAge(this.date);
            this.isNewEntry = true;
        }

        this.__defineGetter__("timestamp", function () {
            return timestamp;
        });
        this.__defineSetter__("timestamp", function (value) {
            if (!value)
                throw new Error("Can't set empty timestamp to Entry.");

            if (!timestamp)
                timestamp = value;
            else
                throw new Error("Can't set timestamp to Entry, since it already has one.");
        });

        this.__defineGetter__("type", function () {
            return type;
        });
    }

    Entry.prototype = {
        getCloudData: function(){
            return {
                playerId: this.player.playerId,
                age: this.player.getAge(this.date),
                timestamp: this.timestamp,
                date: this.date,
                properties: this.properties,
                type: this.type.id,
                id: this.cloudId,
                deleted: !!this._deleted,
                description: this.description
            }
        },
        remove: function (absoluteDelete) {
            if (!this.timestamp)
                throw new Error("Can't delete entry - it hasn't been saved yet.");

            if (absoluteDelete){
                return entriesObjectStore.delete(this.timestamp).catch(function(error){
                    console.error("Can't delete entry: ", error);
                    return $q.reject("Can't delete entry");
                });
            }
            else {
                this._deleted = true;
                this.save();
            }

            return this;
        },
        save: function (isSynced) {
            var self = this;

            if (!this.timestamp) {
                this.isNewEntry = true;
                this.timestamp = new Date().valueOf();
                return doSave();
            }
            else {
                return entriesObjectStore.find(this.timestamp).then(function(existingEntry){
                    self.isNewEntry = !existingEntry;

                    // The entry is deleted and the changed has been synced to cloud, can proceed to completely delete:
                    if (self._deleted && isSynced) {
                        self.isNewEntry = false;
                        return existingEntry ? self.remove(true) : self;
                    }

                    return doSave();
                });
            }

            function doSave() {
                var dbEntry = {
                        date: self.date,
                        age: self.player.getAge(self.date),
                        properties: self.properties,
                        type: self.type.id,
                        timestamp: self.timestamp,
                        playerId: self.player.playerId,
                        cloudId: self.cloudId,
                        description: self.description,
                        updatedAt: new Date()
                    };

                if (!isSynced)
                    dbEntry.unsynced = 1;

                if (self._deleted)
                    dbEntry.unsynced = dbEntry.deleted = 1;

                return entriesObjectStore.upsert(dbEntry).then(function (id) {
                    return self;
                }, function (error) {
                    alert("ERROR: " + JSON.stringify(error));
                });
            }
        },
        unremove: function(){
            if (!this._deleted)
                return false;

            this._deleted = false;
            this.save();
        }
    };

    Entry.getEntries = function (options) {
        options = options || {};

        return entriesObjectStore.internalObjectStore(OBJECT_STORE_NAME, "readonly").then(function(objectStore){
            var idx = objectStore.index(options.unsynced ? "unsync_idx" : options.type ? "type_idx" : "date_idx");
            var count = options.count || null,
                entries = [],
                currentRecord = 0,
                deferred = $q.defer(),
                cursorRange = options.unsynced ? null : IDBKeyRange.bound(
                    options.type ? [options.playerId, options.type] : [options.playerId],
                    options.type ? [options.playerId, options.type, new Date()] : [options.playerId, new Date()]
                ),
                cursor = idx.openCursor(cursorRange, options.reverse ? "prev" : "next");

            cursor.onsuccess = function(event) {
                var cursor = event.target.result;
                if (!cursor || count && currentRecord === count) {
                    deferred.resolve(entries);
                    return;
                }

                if (options.offset && currentRecord < options.offset) {
                    currentRecord = options.offset;
                    cursor.advance(options.offset);
                }
                else {
                    if(!cursor.value.deleted || options.includeDeleted) {
                        entries.push(new Entry(cursor.value));
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

    Entry.getUnsyncedEntries = function(){
        return Entry.getEntries({ unsynced: true, includeDeleted: true });
    };

    return Entry;
}]);