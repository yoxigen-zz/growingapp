'use strict';

angular.module("EntryType", ["Icons"]).factory("EntryType", ["Icon", function(Icon){
    function EntryType(config){
        for(var p in config){
            if (config.hasOwnProperty(p)){
                if (p === "icon" || p === "insightIcon")
                    this[p] = new Icon(config[p]);
                else
                    this[p] = config[p];
            }
        }
    }


    EntryType.prototype.__defineGetter__("templateName", function(){
        return this.template || this.id;
    });

    return EntryType;
}]);