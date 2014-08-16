"use strict";

app.factory("Entry", ["$q", "$indexedDB", "entries", function getEntryClassFactory($q, $indexedDB, entries) {
    var OBJECT_STORE_NAME = "entries",
        PAGE_SIZE = 10,
        entriesObjectStore = $indexedDB.objectStore(OBJECT_STORE_NAME);

    function Entry(type, child) {
        var timestamp;

        if (type.timestamp && type.childId && type.properties)
        {
            var entryData = type;
            type = entries.types[entryData.type];

            timestamp = entryData.timestamp;
            this.date = entryData.date;
            this.properties = entryData.properties;
            this.childId = { id: entryData.childId };
        }
        else{
            this.date = new Date();
            this.properties = {};
            this.child = child;
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
        remove: function () {
            if (!this.timestamp)
                throw new Error("Can't delete entry - it hasn't been saved yet.");

            return entriesObjectStore.delete(this.timestamp).catch(function(error){
                console.error("Can't delete entry: ", error);
                return $q.reject("Can't delete entry");
            });
        },
        save: function () {
            if (!this.timestamp) {
                this.isNewEntry = true;
                this.timestamp = new Date().valueOf();
            }
            else
                this.isNewEntry = false;

            var newEntry = this,
                dbEntry = {
                    date: this.date,
                    properties: this.properties,
                    type: this.type.id,
                    timestamp: this.timestamp,
                    childId: this.child.id
                };

            return entriesObjectStore.insert(dbEntry).then(function (id) {
                return newEntry;
            }, function(error){
                alert("ERROR: " + JSON.stringify(error));
            });
        }
    };

    Entry.getEntries = function (options) {
        options = options || {};

        return entriesObjectStore.internalObjectStore(OBJECT_STORE_NAME, "readonly").then(function(objectStore){
            var idx = objectStore.index("date_idx");
            var count = options.count || PAGE_SIZE,
                entries = [],
                currentRecord = 0,
                deferred = $q.defer(),
                cursor = idx.openCursor(null, "prev");

            cursor.onsuccess = function(event) {
                var cursor = event.target.result;
                if (!cursor || currentRecord === count) {
                    deferred.resolve(entries);
                    return;
                }

                if (options.offset && currentRecord < options.offset) {
                    currentRecord = options.offset;
                    cursor.advance(options.offset);
                }
                else{
                    entries.push(cursor.value);
                    cursor.continue();
                    currentRecord++;
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

    return Entry;
}]);