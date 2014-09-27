app.factory("cloud", ["$q", "eventBus", "Entry", "Player", "Storage", function($q, eventBus, Entry, Player, Storage){
    eventBus.subscribe("saveEntry", syncEntry);
    eventBus.subscribe("deleteEntry", syncEntry);

    var storage = new Storage().cloud;

    function syncEntry(entry){
        storage.setItem("Entry", entry.getCloudData()).then(function(savedData){
            entry.cloudId = savedData.id;
            entry.save(true);
            eventBus.triggerEvent("updateEntries", { entries: [entry] });
        }, function(error){
            console.error("ERROR syncing entries: ", error);
        });
    }

    function sync(){
        Entry.getUnsyncedEntries().then(function(unsyncedEntries){
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
        });

        Player.getAll({ unsynced: true}).then(function(unsyncedPlayers){
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
        });
    }

    return {
        sync: sync
    }
}]);