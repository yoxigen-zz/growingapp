"use strict";

angular.module("BabyApp").factory("Entry", function getEntryClassFactory(){
    function Entry(id){
        var entryTime;

        this.__defineGetter__("id", function(){
            return id;
        });
        this.__defineSetter__("id", function(value){
            if (!id)
                id = value;
            else
                throw new Error("Can't set id to Entry, since it already has one.");
        });
    }

    Entry.prototype = {
        delete: function(){

        },
        save: function(){

        }
    };

    Entry.getEntries = function(options){

    };

    return Entry;
});