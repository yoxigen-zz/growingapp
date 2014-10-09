app.factory("cloud", ["$q", "eventBus", "Entry", "Player", "Storage", "users", function($q, eventBus, Entry, Player, Storage, users){
    eventBus.subscribe("saveEntry", syncEntry);
    eventBus.subscribe("deleteEntry", syncEntry);
    eventBus.subscribe("savePlayer", syncPlayer);
    eventBus.subscribe("deletePlayer", syncPlayer);
    eventBus.subscribe("login", onLogin);
    eventBus.subscribe("logout", function(){
        cloudEnabled = false;
    });

    var storage = new Storage().cloud,
        lastUpdateTime = localStorage.getItem("lastSync"),
        cloudEnabled = users.getCurrentUser();

    if (lastUpdateTime)
        lastUpdateTime = new Date(parseInt(lastUpdateTime));

    function onLogin(){
        cloudEnabled = true;
        sync();
    }

    function syncEntry(entry){
        if (!cloudEnabled)
            return;

        storage.setItem("Entry", entry.getCloudData()).then(function(savedData){
            entry.cloudId = savedData.id;
            entry.save(true);
            eventBus.triggerEvent("updateEntries", { entries: [entry] });
        }, function(error){
            console.error("ERROR syncing entries: ", error);
        });
    }

    function syncPlayer(player){
        if (!cloudEnabled)
            return;

        storage.setItem("Player", player.getCloudData()).then(function(savedData){
            player.cloudId = savedData.id;
            player.save(true);
            eventBus.triggerEvent("updatePlayers", { players: [player] });
        }, function(error){
            console.error("ERROR syncing players: ", error);
        });
    }

    function syncObjects(className){
        return storage.query(className, lastUpdateTime ? { greaterThan: ["updatedAt", lastUpdateTime] } : null).then(function(results){
            if (!results || !results.length)
                return;

            var objs = [],
                promises = [],
                objectClass = className === "Entry" ? Entry : Player;

            results.forEach(function(cloudObject){
                var objectData = cloudObject.getData();

                // If the case that the object was both created and deleted after the last update, no action is required:
                if (lastUpdateTime && lastUpdateTime < cloudObject.createdAt && objectData.deleted)
                    return true;

                var obj = new objectClass(objectData);
                obj.cloudId = cloudObject.id;

                promises.push(obj.save(true).then(function(){
                    objs.push(obj);
                }));
            });

            return $q.all(promises).then(function(){
                if (objs.length) {
                    if (className === "Entry")
                        eventBus.triggerEvent("updateEntries", { entries: objs });
                    else if (className === "Player")
                        eventBus.triggerEvent("updatePlayers", { players: objs });
                }
                return objs;
            });
        }, function(error){
            console.error("Can't fetch " + className + " data from cloud. Error: ", error);
            return $q.reject(error);
        });
    }

    function setLastUpdateTime(){
        lastUpdateTime = new Date();
        localStorage.setItem("lastSync", lastUpdateTime.valueOf());
    }

    function syncFromCloud(){
        if (!cloudEnabled)
            return;

        return syncObjects("Player").then(function(players){
            Player.updatePlayers(players);
            syncObjects("Entry").then(setLastUpdateTime);
        });
    }

    function syncToCloud(){
        if (!cloudEnabled)
            return;

        var promises = [];

        promises.push(Entry.getUnsyncedEntries().then(function(unsyncedEntries){
            if (unsyncedEntries.length){
                var entriesToSave = [];
                unsyncedEntries.forEach(function(entry){
                    entriesToSave.push(entry.getCloudData());
                });

                storage.setItems("Entry", entriesToSave).then(function(savedData){
                    savedData.forEach(function(entryCloudData, i){
                        var entry = unsyncedEntries[i];
                        entry.cloudId = entryCloudData.id;
                        entry.save(true);
                    });

                    eventBus.triggerEvent("updateEntries", { entries: unsyncedEntries });
                }, function(error){
                    console.error("ERROR syncing entries: ", error);
                });
            }
        }));

        promises.push(Player.getAll({ unsynced: true}).then(function(unsyncedPlayers){
            if (unsyncedPlayers.length){
                var syncData = [];
                unsyncedPlayers.forEach(function(player){
                    syncData.push(player.getCloudData());
                });

                storage.setItems("Player", syncData).then(function(savedData){
                    savedData.forEach(function(playerCloudData, i){
                        var player = unsyncedPlayers[i];
                        player.cloudId = playerCloudData.id;
                        player.save(true);
                    });
                }, function(error){
                    console.error("ERROR syncing players: ", error);
                });
            }
        }));

        return $q.all(promises);
    }

    var isSyncing;

    function sync(){
        if (!cloudEnabled || isSyncing)
            return;

        isSyncing = true;
        Player.getAll().then(function(){
            syncFromCloud().finally(function(){
                syncToCloud().finally(function(){
                    isSyncing = false;
                });
            });
        });
    }

    return {
        sync: sync
    }
}]);