define(["angular", "classes/player", "services/config", "services/eventbus", "services/utils", "modules/dialogs/dialogs_module"], function(angular){
    "use strict";

    angular.module("Players", ["Player", "Config", "EventBus", "Utils", "Dialogs", "Messages"]).factory("players", players);

    players.$inject = ["$q", "Player", "config", "eventBus", "utils", "dialogs", "messages"];

    function players($q, Player, config, eventBus, utils, dialogs, messages){
        var playersIndex;

        var api = {
            addNewPlayer: function(showDialog){
                return api.editPlayer(new Player(), showDialog);
            },
            allPlayers: null,
            /**
             * Clear the current players model, to use on logout
             */
            clear: function(){
                api.allPlayers = [];
                setCurrentPlayer(null);
            },
            currentPlayer: null,
            editPlayer: function(player, openDialog){
                if (!(player instanceof Player))
                    throw new TypeError("Can't edit player - expecting a Player object, got: " + player);

                api.editedPlayer = angular.copy(player);

                if (openDialog) {
                    setEditPlayerActions(!player.playerId);
                    dialogs.editPlayer.open();
                }
            },
            getAll: getAllPlayers,
            getCurrentPlayer: getCurrentPlayer,
            getCurrentPlayerId: function(){
                return getCurrentPlayer().then(function(player){
                    return player && player.playerId;
                });
            },
            getPlayerById: getPlayerById,
            removeEditedPlayer: removeEditedPlayer,
            saveEditedPlayer: saveEditedPlayer,
            setCurrentPlayer: setCurrentPlayer,
            updatePlayers: updatePlayers
        };

        var getAllPlayersPromise,
            getAllPlayersDeferreds = [];

        init();

        return api;

        function init(){
            getAllPlayers().then(getCurrentPlayer);

            eventBus.subscribe("updateObjects", onSyncObjects);
        }

        function setCurrentPlayer(player){
            if (player === api.currentPlayer)
                return player;

            if (!player)
                player = api.allPlayers && api.allPlayers ? api.allPlayers[0] : null;
            else {
                player = utils.arrays.find(api.allPlayers, function (_player) {
                    return _player.playerId === player.playerId;
                });
            }

            if (player && player.playerId)
                config.players.setCurrentPlayerId(player.playerId);
            else
                config.players.removeCurrentPlayerId();

            if (api.currentPlayer)
                api.currentPlayer.isCurrentPlayer = false;

            api.currentPlayer = player;

            player.isCurrentPlayer = true;
            eventBus.triggerEvent("playerSelect", player);

            return player;
        }

        function updatePlayers(updatedPlayers) {
            if (updatedPlayers && updatedPlayers.length) {
                updatedPlayers.forEach(function (player) {
                    if (player.deleted && playersIndex[player.playerId])
                        delete playersIndex[player.playerId];
                    else
                        playersIndex[player.playerId] = player;
                });
            }
        }

        function onSyncObjects(e){
            if (e.type !== "Player")
                return;

            var deletedCurrentPlayer,
                syncedPlayers = e.objects;

            syncedPlayers.forEach(function(player){
                if (player.isNew){
                    if (!player.deleted)
                        api.allPlayers.push(player);
                }
                else {
                    var existingPlayer = utils.arrays.find(api.allPlayers, function (p) {
                            return p.playerId === player.playerId;
                        }),
                        existingPlayerIndex;

                    if (existingPlayer) {
                        existingPlayerIndex = api.allPlayers.indexOf(existingPlayer);
                        if (player.deleted)
                            api.allPlayers.splice(existingPlayerIndex, 1);
                        else {
                            if (!api.allPlayers)
                                api.allPlayers = [];

                            api.allPlayers[existingPlayerIndex] = player;
                        }
                    }

                    if (api.currentPlayer && player.playerId === api.currentPlayer.playerId) {
                        if (player.deleted)
                            deletedCurrentPlayer = true;
                        else
                            api.currentPlayer = player;
                    }
                }
            });

            setPlayersIndex();

            if ((!api.currentPlayer && api.allPlayers.length)|| deletedCurrentPlayer)
                setFirstPlayer();
        }

        function setFirstPlayer(){
            setCurrentPlayer(api.allPlayers && api.allPlayers.length ? api.allPlayers[0] : null);
        }

        function getAllPlayers(){
            if (api.allPlayers)
                return $q.when(api.allPlayers);

            if (getAllPlayersPromise){
                var deferred = $q.defer();
                getAllPlayersDeferreds.push(deferred);
                return deferred.promise;
            }

            return getAllPlayersPromise = Player.getAll().then(function (players) {
                if (!playersIndex)
                    playersIndex = {};

                players.forEach(function (player) {
                    if (!playersIndex[player.playerId])
                        playersIndex[player.playerId] = player;
                });

                getAllPlayersDeferreds.forEach(function(deferred){
                    deferred.resolve(players);
                });

                getAllPlayersPromise = getAllPlayersDeferreds = null;

                api.allPlayers = players;
                setPlayersIndex();

                return api.allPlayers;
            });
        }

        function setPlayersIndex(){
            playersIndex = {};
            api.allPlayers.forEach(function (player) {
                if (!playersIndex[player.playerId])
                    playersIndex[player.playerId] = player;
            });
        }

        /**
         * Gets a player by ID. Assumes that players have already been loaded
         * @param playerId
         * @returns {*}
         */
        function getPlayerById(playerId) {
            /*
            if (!playersIndex) {
                return getAllPlayers().then(function(players){
                    return playersIndex[playerId];
                });
            }
            */
            return playersIndex[playerId];
        }

        function getCurrentPlayer() {
            if (api.currentPlayer)
                return $q.when(api.currentPlayer);

            var currentPlayerId = config.players.getCurrentPlayerId();
            if (currentPlayerId)
                return $q.when(setCurrentPlayer(getPlayerById(currentPlayerId)));
            else {
                return getAllPlayers().then(function(allPlayers){
                    if (allPlayers && allPlayers.length)
                        return setCurrentPlayer(allPlayers[0]);

                    return null;
                });
            }
        }

        function removeEditedPlayer(){
            messages.confirm("Are you sure you wish to remove this child from the list?").then(function(confirmed){
                if (!confirmed)
                    return;

                api.editedPlayer.remove().then(function(){
                    if (api.editedPlayer.isCurrentPlayer)
                        api.editedPlayer.isCurrentPlayer = false;

                    for(var i=0; i < api.allPlayers.length; i++){
                        if (api.allPlayers[i].playerId === api.editedPlayer.playerId){
                            api.allPlayers.splice(i, 1);

                            if (!api.allPlayers.length)
                                api.addNewPlayer(true);

                            dialogs.editPlayer.close();

                            if (api.currentPlayer && api.editedPlayer.playerId === api.currentPlayer.playerId)
                                setFirstPlayer();

                            eventBus.triggerEvent("deletePlayer", api.editedPlayer);

                            api.editedPlayer = null;
                            break;
                        }
                    }
                });
            });
        }

        function saveEditedPlayer(){
            var editedPlayer = api.editedPlayer;
            
            if (!editedPlayer.name){
                return;
            }

            return editedPlayer.save().then(function(player){
                api.editedPlayer = null;

                if (player.isNew){
                    api.allPlayers.push(player);
                    api.allPlayers.sort(function(a,b){
                        return a.name < b.name ? 1 : -1;
                    });
                }
                else{
                    for(var i= 0, menuPlayer; menuPlayer = api.allPlayers[i]; i++){
                        if (menuPlayer.playerId === player.playerId) {
                            api.allPlayers[i] = player;
                            break;
                        }
                    }
                }

                dialogs.editPlayer.close();
                setCurrentPlayer(player);
                eventBus.triggerEvent("editPlayer", player);
            }, function(error){
                messages.error("Error saving: " + error);
            });
        }

        function setEditPlayerActions(isNewPlayer){
            var actions = [
                { icon: "ok", title: "Save child", onClick: saveEditedPlayer }
            ];

            if(!isNewPlayer)
                actions.splice(0, 0, { icon: "trash", title: "Delete child", onClick: removeEditedPlayer });

            api.editedPlayerActions = actions;
        }

    }
});