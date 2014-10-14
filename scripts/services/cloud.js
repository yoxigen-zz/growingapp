app.factory("cloud", ["$q", "eventBus", "Entry", "Player", "Storage", "users", "config", function($q, eventBus, Entry, Player, Storage, users, config){
    eventBus.subscribe("saveEntry", syncEntry);
    eventBus.subscribe("deleteEntry", syncEntry);
    eventBus.subscribe("savePlayer", syncPlayer);
    eventBus.subscribe("deletePlayer", syncPlayer);
    eventBus.subscribe("login", onLogin);
    eventBus.subscribe("logout", function(){
        cloudEnabled = false;
    });

    var storage = new Storage().cloud,
        cloudEnabled;

    window.addEventListener("online", setCloudEnabled);
    window.addEventListener("offline", setCloudEnabled);

    setCloudEnabled();

    function onLogin(){
        if (cloudEnabled = window.navigator.onLine)
            sync();
    }

    function setCloudEnabled(){
        cloudEnabled = users.getCurrentUser() && window.navigator.onLine;
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
        return storage.query(className, config.sync.lastSyncTimestamp ? { greaterThan: ["updatedAt", config.sync.lastSyncTimestamp] } : null).then(function(results){
            if (!results || !results.length)
                return;

            var objs = [],
                promises = [],
                objectClass = className === "Entry" ? Entry : Player;

            results.forEach(function(cloudObject){
                var objectData = cloudObject.getData();

                // If the case that the object was both created and deleted after the last update, no action is required:
                if (objectData.deleted && (!config.sync.lastSyncTimestamp || (config.sync.lastSyncTimestamp && config.sync.lastSyncTimestamp < cloudObject.createdAt) ))
                    return true;

                try{
                    var obj = new objectClass(objectData);
                    obj.cloudId = cloudObject.id;

                    promises.push(obj.save(true).then(function(){
                        objs.push(obj);
                    }));
                }
                catch(e){
                    console.error("Can't create or save object: ", e);
                }
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
        config.sync.lastSyncTimestamp = new Date();
    }

    function syncFromCloud(){
        if (!cloudEnabled)
            return;

        return syncObjects("Player").then(function(players){
            Player.updatePlayers(players);
            return syncObjects("Entry").then(setLastUpdateTime);
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
        eventBus.triggerEvent("loadingStart");

        Player.getAll().then(function(){
            syncFromCloud().finally(function(){
                syncToCloud().finally(function(){
                    isSyncing = false;
                    eventBus.triggerEvent("loadingEnd");
                });
            });
        });
    }

    return {
        sync: sync
    }
}]);