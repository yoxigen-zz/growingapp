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

            if (entryData.deleted)
                this._deleted = entryData.deleted;

            if (entryData.cloudId)
                this.cloudId = entryData.cloudId;
        }
        else{
            this.date = new Date();
            this.properties = {};
            this.player = player;
            this.age = player.getAge(this.date);
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
        isNewEntry: function(){
            return !this.timestamp;
        },
        getCloudData: function(){
            return {
                playerId: this.player.playerId,
                age: this.age,
                timestamp: this.timestamp,
                date: this.date,
                properties: this.properties,
                type: this.type.id,
                id: this.cloudId,
                deleted: !!this._deleted
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
        },
        save: function (isSynced) {
            if (!this.timestamp) {
                this.isNewEntry = true;
                this.timestamp = new Date().valueOf();
            }
            else {
                this.isNewEntry = false;
                // The entry is deleted and the changed has been synced to cloud, can proceed to completely delete:
                if (this._deleted && isSynced)
                    return this.remove(true);
            }
            var newEntry = this,
                dbEntry = {
                    date: this.date,
                    age: this.player.getAge(this.date),
                    properties: this.properties,
                    type: this.type.id,
                    timestamp: this.timestamp,
                    playerId: this.player.playerId,
                    cloudId: this.cloudId
                };

            if (!isSynced)
                dbEntry.unsynced = 1;

            if (this._deleted)
                dbEntry.unsynced = dbEntry.deleted = 1;

            return entriesObjectStore.upsert(dbEntry).then(function (id) {
                return newEntry;
            }, function(error){
                alert("ERROR: " + JSON.stringify(error));
            });
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