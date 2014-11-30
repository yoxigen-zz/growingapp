"use strict";

app.factory("Entry", ["$q", "$indexedDB", "entries", "Player", "DataObject", "config", function getEntryClassFactory($q, $indexedDB, entries, Player, DataObject, config) {
    var OBJECT_STORE_NAME = "entries",
        entriesObjectStore = $indexedDB.objectStore(OBJECT_STORE_NAME);

    function Entry(type, player) {
        var timestamp;

        if (type instanceof Entry || (type.timestamp && type.playerId && type.properties))
        {
            var entryData = type;
            type = type instanceof Entry ? type.type : entries.types[entryData.type];

            timestamp = entryData.timestamp;
            this.date = entryData.date;
            this.age = entryData.age;
            this.properties = entryData.properties;
            this.player = entryData.player || Player.getById(entryData.playerId);
            if (!this.player)
                throw new Error("Can't create entry - no player found for playerId " + entryData.playerId);

            this.description = entryData.description;

            if (entryData.deleted)
                this._deleted = entryData.deleted;

            if (entryData.cloudId)
                this.cloudId = entryData.cloudId;

            this.isNew = false;
        }
        else{
            this.date = new Date();
            this.properties = {};
            this.player = player;
            this.age = player.getAge(this.date);
            this.isNew = true;
        }

        this.__defineGetter__("timestamp", function () {
            return timestamp;
        });
        this.__defineSetter__("timestamp", function (value) {
            if (!value)
                throw new Error("Can't set empty timestamp to Entry.");

            if (!timestamp)
                timestamp = value;
            else if (value !== timestamp)
                throw new Error("Can't change an Entry's timestamp.");
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
                image: this.imageUrl,
                timestamp: this.timestamp,
                date: this.date,
                properties: this.properties,
                type: this.type.id,
                id: this.cloudId,
                deleted: !!this._deleted,
                description: this.description
            }
        },
        /**
         * Gets the entry's data, for saving in the offline database.
         * @param isSynced Whether the data for this entry is already synced in the cloud (in which case the data arrived from the cloud)
         */
        getLocalData: function(){
            if (!this.player)
                throw new Error("Can't get local data - entry has no player.");

            var localData = {
                date: this.date,
                age: this.player.getAge(this.date),
                properties: this.properties,
                type: this.type.id,
                timestamp: this.timestamp,
                playerId: this.player.playerId,
                cloudId: this.cloudId,
                description: this.description,
                updatedAt: new Date()
            };

            if (this.image)
                localData.image = this.image;

            if (this.imageUrl)
                localData.imageUrl = this.imageUrl;

            return localData;
        },
        get idProperty(){ return "timestamp" },
        getNewId: function(){
            return new Date().valueOf()
        },
        imagesConfig: config.entries.images,
        objectStore: entriesObjectStore,
        preSave: function(){
            if (this.type.preSave)
                this.type.preSave(this);
        }
    };

    Entry.prototype.__proto__ = new DataObject();

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