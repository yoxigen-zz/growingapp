"use strict";

app.factory("Entry", ["$q", "$sce", "$indexedDB", "entries", "Player", "FileData", "DataObject", "dbConfig", "config", "images", "utils",
    function getEntryClassFactory($q, $sce, $indexedDB, entries, Player, FileData, DataObject, dbConfig, config, images, utils) {
    var OBJECT_STORE_NAME = dbConfig.objectStores.entries.name,
        entriesObjectStore = $indexedDB.objectStore(OBJECT_STORE_NAME);

    function Entry(config, player) {
        var timestamp,
            entryType;

        if (config instanceof Entry || (config.timestamp && config.playerId && config.properties))
        {
            var entryData = config;
            entryType = config instanceof Entry ? config.type : entries.types[entryData.type];

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

            if (entryData.imageId) {
                this.imageId = entryData.imageId;
                this.image = new FileData(entryData.imageId);
            }

            this.isNew = false;
        }
        else{
            if (!entries.isValidEntryType(config))
                throw new TypeError("Invalid config for Entry, must be either an Entry object or an entry type config object.");

            if (!player)
                throw new Error("Can't create Entry object without player.");

            if (!(player instanceof Player))
                throw new TypeError("Can't create Entry, invalid player, must be an instance of Player.");

            entryType = config;
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
            return entryType;
        });
    }

    Entry.prototype.getCloudData = function(){
        return angular.extend(this.getBaseCloudData(), {
            playerId: this.player.playerId,
            age: this.player.getAge(this.date),
            timestamp: this.timestamp,
            date: this.date,
            properties: this.properties,
            type: this.type.id,
            id: this.cloudId,
            description: this.description
        });
    };

    Entry.prototype.__defineGetter__("html", function(){
        if (!this._html) {
            var htmlStr;

            if (typeof(this.type.html) === "function")
                htmlStr = this.type.html(this, this.player, config);
            else
                htmlStr = utils.strings.parse(this.type.html, this);

            this._html = $sce.trustAsHtml(htmlStr);
        }

        return this._html;
    });

    Entry.prototype.__defineGetter__("dateText", function(){
        if (!this._dateText)
            this._dateText = config.getLocalizedDate(this.date) + " (" + utils.dates.dateDiff(this.date, this.player.birthday) + ")";

        return this._dateText;
    });

    /**
     * Gets the entry's data, for saving in the offline database.
     * @param isSynced Whether the data for this entry is already synced in the cloud (in which case the data arrived from the cloud)
     */
    Entry.prototype.getLocalData = function(){
        if (!this.player)
            throw new Error("Can't get local data - entry has no player.");

        return angular.extend(this.getBaseLocalData(), {
            date: this.date,
            age: this.player.getAge(this.date),
            properties: this.properties,
            type: this.type.id,
            timestamp: this.timestamp,
            playerId: this.player.playerId,
            description: this.description,
            updatedAt: new Date()
        });
    };

    Entry.prototype.__defineGetter__("idProperty", function(){
        return "timestamp";
    });

    Entry.prototype.getNewId = function(){
        return new Date().valueOf()
    };

    Entry.prototype.objectStore = entriesObjectStore;
    Entry.prototype.preSave = function(){
        this.clearParsedValues();

        if (this.type.preSave)
            this.type.preSave(this);
    };

    /**
     * Clears values that are returned from getters. Used for when app-level settings are changed, which could affect parsed values.
     */
    Entry.prototype.clearParsedValues = function(){
        delete this._html;
        delete this._dateText;
    };

    Entry.prototype.addPhoto = function(method){
        return images.addPhotoToDataObject(config.entries.images, this, method);
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

    Entry.getAll = function(options){
        options = options || {};
        return Entry.getEntries(options);
    };

    Entry.getUnsyncedEntries = function(){
        return Entry.getEntries({ unsynced: true, includeDeleted: true });
    };

    return Entry;
}]);