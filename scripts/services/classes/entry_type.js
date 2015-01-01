'use strict';

angular.module("EntryType", []).factory("EntryType", function(){
    function EntryType(config){
        for(var p in config){
            if (config.hasOwnProperty(p)){
                this[p] = config[p];
            }
        }
    }


    EntryType.prototype.__defineGetter__("templateName", function(){
        return this.template || this.id;
    });

    EntryType.prototype.__defineGetter__("iconCssUrl", function(){
        if (!this._iconCssUrl)
            this._iconCssUrl = "url(images/icons/" + this.icon + ".svg)";

        return this._iconCssUrl;
    });

    return EntryType;
});