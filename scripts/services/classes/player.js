define(["angular", "classes/data_object", "classes/file_data", "services/dbconfig", "services/config", "services/utils", "services/images"], function(angular){
    "use strict";

    angular.module("Player", ["xc.indexedDB", "DBConfig", "Config", "Utils", "DataObject", "Images", "FileData"]).factory("Player", PlayerClass);

    PlayerClass.$inject = ["$q", "$indexedDB", "dbConfig", "config", "DataObject", "images", "FileData", "utils"];

    function PlayerClass($q, $indexedDB, dbConfig, config, DataObject, images, FileData, utils) {
        var playersObjectStore = $indexedDB.objectStore(dbConfig.objectStores.players.name),
            dayMilliseconds = 1000 * 60 * 60 * 24;

        function Player(data) {
            var id;

            if (data && data.playerId && data.name)
            {
                angular.extend(this, data);
                id = data.playerId;

                if (typeof(this.gender) === "string")
                    this.gender = config.getGender(this.gender);

                this.init(data);
                if (!data.image && data.imageId)
                    this.image = new FileData(data.imageId);
            }
            else {
                this.gender = config.getGender("f");
                this.birthday = new Date();
            }

            this.__defineGetter__("playerId", function () {
                return id;
            });
            this.__defineSetter__("playerId", function (value) {
                if (!value)
                    throw new Error("Can't set empty id to Player.");

                if (!id)
                    id = value;
                else if (value !== id)
                    throw new Error("Can't change a Player's id.");
            });
        }

        /**
         * Returns the age of this player, in days, for the specified date. If no date is specified, returns the current age.
         * @param date
         * @returns {*}
         */
        Player.prototype.getAge = function(date){
            if (!date)
                date = new Date();

            if (!angular.isDate(date))
                throw new Error("Invalid date: ", date);

            if (!this.birthday || date < this.birthday)
                return null;

            return Math.floor((date - this.birthday) / dayMilliseconds);
        };

        Player.prototype.__defineGetter__("ageText", function () {
            if (!this._ageText)
                this._ageText = utils.dates.dateDiff(new Date(), this.birthday, false);

            return this._ageText;
        });

        Player.prototype.getCloudData = function(){
            return angular.extend(this.getBaseCloudData(), {
                playerId: this.playerId,
                birthday: this.birthday,
                name: this.name,
                gender: this.gender.id,
                id: this.cloudId
            });
        };

        Player.prototype.getLocalData = function(){
            var localData = {
                name: this.name,
                birthday: this.birthday,
                gender: this.gender.id
            };

            if (this.playerId)
                localData.playerId = this.playerId;

            return angular.extend(this.getBaseLocalData(), localData);
        };

        Player.prototype.__defineGetter__("idProperty", function(){
            return "playerId";
        });

        Player.prototype.objectStore = playersObjectStore;
        Player.prototype.validate = function(){
            if (!this.name)
                throw "Can't save, missing name.";
        };

        Player.prototype.__proto__ = DataObject;
        Player.prototype.addPhoto = function(method){
            return images.addPhotoToDataObject(config.players.playerImageSize, this, method);
        };

        Player.getAll = function (options) {
            if (!options && Player.players)
                return $q.when(Player.players);

            options = options || {};

            return playersObjectStore.internalObjectStore(dbConfig.objectStores.players.name, "readonly").then(function(objectStore){
                var idx = objectStore.index(options.unsynced ? "unsync_idx" : "name_idx");
                var players = [],
                    deferred = $q.defer(),
                    cursor = idx.openCursor(null);

                cursor.onsuccess = function(event) {
                    var cursor = event.target.result;
                    if (!cursor) {
                        if (!Player.playersIndex)
                            Player.playersIndex = {};

                        players.forEach(function(player){
                            if (!Player.playersIndex[player.playerId])
                                Player.playersIndex[player.playerId] = player;
                        });

                        if (!options)
                            Player.players = players;

                        deferred.resolve(players);
                        return;
                    }

                    players.push(new Player(cursor.value));
                    cursor.continue();
                };

                cursor.onerror = function(event){
                    deferred.reject(event);
                };

                return deferred.promise;
            }, function(){
                return $q.when([]);
            });
        };

        Player.clearAll = function(){
            return playersObjectStore.clear();
        };

        Player.updatePlayers = function(updatedPlayers){
            if (updatedPlayers && updatedPlayers.length){
                updatedPlayers.forEach(function(player){
                    if (player.deleted && Player.playersIndex[player.playerId])
                        delete Player.playersIndex[player.playerId];
                    else
                        Player.playersIndex[player.playerId] = player;
                });
            }
        };

        Player.getById = function(playerId){
            if (!Player.playersIndex){
                return Player.getAll().then(function(players){
                    return Player.playersIndex[playerId];
                }).catch(function(error){
                    return $q.reject("Can't get Player by ID, can't get all players.");
                });
            }

            return Player.playersIndex[playerId];
        };

        Player.getCurrentPlayer = function(){
            var currentPlayerId = config.players.getCurrentPlayerId();
            if (currentPlayerId)
                return $q.when(Player.getById(currentPlayerId));
            else{
                return Player.getAll().then(function(players) {
                    if (players && players.length)
                        return players[0];

                    return null;
                });
            }
        };

        return Player;
    }
});