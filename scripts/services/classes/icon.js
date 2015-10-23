define(["angular"], function(angular){
    'use strict';

    angular.module("Icons", []).factory("Icon", function(){
        var ICONS_PATH = "images/icons/";

        function Icon(iconId){
            if (!iconId || typeof(iconId) !== "string")
                throw new TypeError("Invalid icon, expected a string.");

            this.id = iconId;
        }

        Icon.prototype.__defineGetter__("url", function(){
            if (!this._url)
                this._url = ICONS_PATH + this.id + ".svg";

            return this._url;
        });

        Icon.prototype.__defineGetter__("cssUrl", function(){
            if (!this._cssUrl)
                this._cssUrl = "url(" + this.url + ")";

            return this._cssUrl;
        });

        return Icon;
    });
});