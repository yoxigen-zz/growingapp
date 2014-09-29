app.factory("cloud", ["$q", "eventBus", "Entry", "Player", "Storage", "users", function($q, eventBus, Entry, Player, Storage, users){
    eventBus.subscribe("saveEntry", syncEntry);
    eventBus.subscribe("deleteEntry", syncEntry);
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

    function syncFromCloud(){
        if (!cloudEnabled)
            return;

        return storage.query("Entry", lastUpdateTime ? { greaterThan: ["updatedAt", lastUpdateTime] } : null).then(function(results){
            if (!results || !results.length)
                return;

            var entries = [];
            results.forEach(function(cloudEntry){
                var entry = new Entry(cloudEntry.getData());
                entry.cloudId = cloudEntry.id;

                entry.save(true);
                entry.status = !lastUpdateTime || cloudEntry.createdAt > lastUpdateTime ? "new" : "update";

                entries.push(entry);
            });

            lastUpdateTime = new Date();
            localStorage.setItem("lastSync", lastUpdateTime.valueOf());

            eventBus.triggerEvent("updateEntries", { entries: entries });
            return entries;
        }, function(error){
            console.error("Can't fetch entries from cloud. Error: ", error);
            return $q.reject(error);
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

    function sync(){
        if (!cloudEnabled)
            return;

        syncFromCloud().finally(syncToCloud);
    }

    return {
        sync: sync
    }
}]);