(function(){
    'use strict';

    angular.module("Insights").factory("Insight", function(){
        function Insight(config){
            this.validate(config);
            this.id = config.id;
            this.name = config.name;
            this.entryType = config.entryType;
            this.description = config.description;
            this.className = config.className;
        }

        Insight.prototype.validate = function(config){
            if (!config || Object(config) !== config)
                throw new TypeError("Invalid insight configuration. Expected an object.");

            if (!config.id || typeof(config.id) !== "string")
                throw new Error("Can't create Insight, expected a string 'id' property.");

            if (!config.name || typeof(config.name) !== "string")
                throw new Error("Can't create Insight, expected a string 'name' property.");

            if (config.entryType && config.entryType.constructor.name !== "EntryType")
                throw new TypeError("Can't create Insight. If entryType is specified, it must be an instance of EntryType.");
        };

        Insight.prototype.__defineGetter__("templateUrl", function(){
            return "insights/" + this.id + "/" + this.id + ".html";
        });

        return Insight;
    });
})();