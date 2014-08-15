"use strict";

app.factory("Entry", ["$q", "$indexedDB", function getEntryClassFactory($q, $indexedDB) {
    var OBJECT_STORE_NAME = "entries",
        PAGE_SIZE = 10,
        entriesObjectStore = $indexedDB.objectStore(OBJECT_STORE_NAME);

    function Entry(type, id) {
        var entryTime;

        this.__defineGetter__("id", function () {
            return id;
        });
        this.__defineSetter__("id", function (value) {
            if (!value)
                throw new Error("Can't set empty id to Entry.");

            if (!id)
                id = value;
            else
                throw new Error("Can't set id to Entry, since it already has one.");
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
            if (!this.id) {
                this.isNewEntry = true;
                //this.id = +new Date();
            }
            else
                this.isNewEntry = false;

            var newEntry = this,
                dbEntry = {
                    date: this.date,
                    properties: this.properties,
                    type: this.type.id,
                    createTime: new Date()
                };

            try {
                return entriesObjectStore.insert(dbEntry).then(function (id) {
                    newEntry.id = id;
                    return newEntry;
                });
            } catch(error){
                alert(error);
            }
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
        });
    };

    return Entry;
}]);