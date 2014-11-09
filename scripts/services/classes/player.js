"use strict";

app.factory("Player", ["$q", "$indexedDB", "dbConfig", "config", "DataObject", "parse", "images",
    function getPlayerClassFactory($q, $indexedDB, dbConfig, config, DataObject, parse, images) {
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
        else {
            this.gender = "f";
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

    Player.prototype = {
        /**
         * Uses the images service to take a picture and if successful, add it to the player.
         * @param method "camera" / "browse". Defaults to "camera" if none.
         * @returns {*} The promise is called with the new image
         */
        addPhoto: function(method){
            var player = this;
            player.imageDataUrl = "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";
            player.image = ["data:image/jpg;base64,", player.imageDataUrl].join("");
            return $q.when(player.image);

            return images.getPhoto(method, {
                allowEdit : true,
                targetWidth: config.players.playerImageSize.width,
                targetHeight: config.players.playerImageSize.height,
                saveToPhotoAlbum: false
            }).then(function(dataUrl){
                player.imageDataUrl = dataUrl;
                player.image = ["data:image/jpg;base64,", dataUrl].join("");

                return player.image;
            });
        },
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
                id: this.cloudId,
                deleted: !!this._deleted,
                image: this.image
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
        objectStore: playersObjectStore,
        preSave: function(){
            if (this.imageDataUrl){
                var self = this;

                return parse.uploadFile(this.imageDataUrl, this.name + ".jpg", "image/jpeg").then(function(file){
                    self.image = file.url();
                    delete self.imageDataUrl;
                });
            }
            else
                return true;
        },
        validate: function(){
            if (!this.name)
                throw "Can't save, missing name.";
        }
    };

    Player.prototype.__proto__ = new DataObject();

    Player.getAll = function (options) {
        if (!options && Player.players)
            return $q.when(Player.players);

        options = options || {};

        return playersObjectStore.internalObjectStore(dbConfig.objectStores.players, "readonly").then(function(objectStore){
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
}]);