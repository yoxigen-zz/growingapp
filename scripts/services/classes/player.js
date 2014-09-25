"use strict";

app.factory("Player", ["$q", "$indexedDB", "config", function getPlayerClassFactory($q, $indexedDB, config) {
    var entriesObjectStore = $indexedDB.objectStore(config.objectStores.players),
        dayMilliseconds = 1000 * 60 * 60 * 24;

    function Player(data) {
        var id;

        if (data && data.id && data.name)
        {
            angular.extend(this, data);
            id = data.id;
        }

        this.__defineGetter__("id", function () {
            return id;
        });
        this.__defineSetter__("id", function (value) {
            if (!value)
                throw new Error("Can't set empty id to Player.");

            if (!id)
                id = value;
            else
                throw new Error("Can't set id to Player, since it already has one.");
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
        remove: function () {
            if (!this.id)
                throw new Error("Can't delete player - it hasn't been saved yet.");

            return entriesObjectStore.delete(this.id).catch(function(error){
                console.error("Can't delete player: ", error);
                return $q.reject("Can't delete player");
            });
        },
        save: function () {
            this.isNewPlayer = !this.id;

            var player = this,
                dbPlayer = {
                    name: this.name,
                    birthday: this.birthday,
                    gender: this.gender
                };

            if (this.id)
                dbPlayer.id = this.id;

            if (this.image)
                dbPlayer.image = this.image;

            return entriesObjectStore.upsert(dbPlayer).then(function (id) {
                if (player.isNewPlayer)
                    player.id = id;

                return player;
            }, function(error){
                alert("ERROR: " + JSON.stringify(error));
            });
        }
    };

    Player.getAll = function (options) {
        options = options || {};

        return entriesObjectStore.internalObjectStore(config.objectStores.players, "readonly").then(function(objectStore){
            var idx = objectStore.index("name_idx");
            var players = [],
                deferred = $q.defer(),
                cursor = idx.openCursor(null);

            cursor.onsuccess = function(event) {
                var cursor = event.target.result;
                if (!cursor) {
                    Player.players = {};
                    players.forEach(function(player){
                        Player.players[player.id] = player;
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