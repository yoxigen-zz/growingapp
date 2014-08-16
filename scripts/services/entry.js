"use strict";

app.factory("Entry", ["$q", "$indexedDB", function getEntryClassFactory($q, $indexedDB) {
    var OBJECT_STORE_NAME = "entries",
        PAGE_SIZE = 10,
        entriesObjectStore = $indexedDB.objectStore(OBJECT_STORE_NAME);

    function Entry(type, child) {
        var entryTime,
            timestamp;

        this.child = child;

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

        this.date = new Date();
        this.properties = {};
    }

    Entry.prototype = {
        delete: function () {

        },
        save: function () {
            if (!this.timestamp) {
                this.isNewEntry = true;
                this.timestamp = new Date();
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