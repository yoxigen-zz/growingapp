"use strict";

app.factory("Player", ["$q", "$indexedDB", "dbConfig", "DataObject", function getPlayerClassFactory($q, $indexedDB, dbConfig, DataObject) {
    var playersObjectStore = $indexedDB.objectStore(dbConfig.objectStores.players),
        dayMilliseconds = 1000 * 60 * 60 * 24;

    function Player(data) {
        var id;

        if (data && data.playerId && data.name)
        {
            angular.extend(this, data);
            id = data.playerId;

            if (data.deleted)
                this._deleted = data.deleted;

            if (data.cloudId)
                this.cloudId = data.cloudId;
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

    Player.prototype = {
        /**
         * Returns the age of this player, in days, for the specified date. If no date is specified, returns the current age.
         * @param date
         * @returns {*}
         */
        getAge: function(date){
            if (!date)
                date = new Date();

            if (!angular.isDate(date))
                throw new Error("Invalid date: ", date);

            if (!this.birthday || date < this.birthday)
                return null;

            return Math.floor((date - this.birthday) / dayMilliseconds);
        },
        getCloudData: function(){
            return {
                playerId: this.playerId,
                birthday: this.birthday,
                name: this.name,
                gender: this.gender,
                id: this.cloudId
            }
        },
        getLocalData: function(){
            var localData = {
                name: this.name,
                birthday: this.birthday,
                gender: this.gender,
                cloudId: this.cloudId
            };

            if (this.playerId)
                localData.playerId = this.playerId;

            if (this.image)
                localData.image = this.image;

            return localData;
        },
        get idProperty(){ return "playerId" },
        objectStore: playersObjectStore
    };

    Player.prototype.__proto__ = new DataObject();

    Player.getAll = function (options) {
        options = options || {};

        return playersObjectStore.internalObjectStore(dbConfig.objectStores.players, "readonly").then(function(objectStore){
            var idx = objectStore.index(options.unsynced ? "unsync_idx" : "name_idx");
            var players = [],
                deferred = $q.defer(),
                cursor = idx.openCursor(null);

            cursor.onsuccess = function(event) {
                var cursor = event.target.result;
                if (!cursor) {
                    if (!Player.players)
                        Player.players = {};

                    players.forEach(function(player){
                        if (!Player.players[player.playerId])
                            Player.players[player.playerId] = player;
                    });

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

    Player.getById = function(playerId){
        if (!Player.players){
            return Player.getAll().then(function(players){
                return Player.players[playerId];
            }).catch(function(error){
                return $q.reject("Can't get Player by ID, can't get all players.");
            });
        }

        return Player.players[playerId];
    };

    return Player;
}]);