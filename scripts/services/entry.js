"use strict";

app.factory("Entry", ["$q", "$indexedDB", function getEntryClassFactory($q, $indexedDB) {
    var OBJECT_STORE_NAME = "entries",
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
                    date: this.date.valueOf(),
                    properties: this.properties,
                    type: this.type.id,
                    createTime: new Date().valueOf()
                };


            return entriesObjectStore.insert(dbEntry).then(function(id){
                newEntry.id = id;
                return newEntry;
            });
        }
    };

    Entry.getEntries = function (options) {

    };

    return Entry;
}]);