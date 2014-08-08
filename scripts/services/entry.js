"use strict";

app.factory("Entry", ["$q", function getEntryClassFactory($q) {
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
                this.id = +new Date();
            }
            else
                this.isNewEntry = false;

            return $q.when(this);
        }
    };

    Entry.getEntries = function (options) {

    };

    return Entry;
}]);