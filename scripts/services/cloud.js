app.factory("cloud", ["$q", "eventBus", "Entry", "Player", "Storage", "users", "config", function($q, eventBus, Entry, Player, Storage, users, config){

    var storage = new Storage().cloud,
        cloudEnabled,
        isSyncing;

    eventBus.subscribe(["saveEntry", "deleteEntry", "editPlayer", "deletePlayer"], syncDataObject);
    eventBus.subscribe("login", onLogin);
    eventBus.subscribe("logout", function(){ cloudEnabled = false; });
    eventBus.subscribe("sync", sync);
    eventBus.subscribe("settingsChange", syncSettings);

    window.addEventListener("online", setCloudEnabled);
    window.addEventListener("offline", setCloudEnabled);

    setCloudEnabled();

    return {
        sync: sync
    };

    function onLogin(){
        if (cloudEnabled = window.navigator.onLine)
            sync();
    }

    function setCloudEnabled(){
        cloudEnabled = users.getCurrentUser() && window.navigator.onLine;
    }

    function syncDataObject(dataObject){
        if (!cloudEnabled)
            return;

        syncImageToCloud(dataObject).then(function(uploaded){
            storage.setItem(dataObject.constructor.name, dataObject.getCloudData()).then(function(savedData){
                dataObject.cloudId = savedData.id;
                dataObject.save(true);
                eventBus.triggerEvent("updateObjects", { type: dataObject.constructor.name, objects: [dataObject] });
            }, function(error){
                console.error("ERROR syncing " + dataObject.constructor.name + " object: ", error);
            });
        });
    }

    function syncSettings(e){
        if (!cloudEnabled || (e && e.fromCloud))
            return;

        var currentUser = users.getCurrentUser();
        if (!currentUser)
            return;

        currentUser.attributes.settings = config.getCurrentLocalization();
        if (!currentUser.attributes.settings.__updateTime__)
            currentUser.attributes.settings.__updateTime__ = new Date();

        currentUser.save();
    }

    /**
     * If the specified dataObject has an unsynced image, the image will be uploaded to cloud and the cloudUrl will be saved, otherwise does nothing.
     * @param dataObject
     * @returns {*}
     */
    function syncImageToCloud(dataObject){
        if (dataObject.image && dataObject.image.unsynced){
            return storage.uploadFile(dataObject.image.localUrl, dataObject.cloudId + ".jpg", "image/jpeg").then(function(file){
                dataObject.image.cloudUrl = file.url;
                delete image.unsynced;
                return true;
            }, function(error){
                alert("Can't upload image file: " + error);
            });
        }

        return $q.when(false);
    }

    function syncObjectsFromCloud(className){
        return storage.query(className, config.sync.lastSyncTimestamp ? { greaterThan: ["updatedAt", config.sync.lastSyncTimestamp] } : null).then(function(results){
            if (!results || !results.length)
                return;

            var dataObjects = [],
                promises = [],
                objectClass = className === "Entry" ? Entry : Player;

            results.forEach(function(cloudObject){
                var objectData = cloudObject.getData();

                // If the case that the object was both created and deleted after the last update, no action is required:
                if (objectData.deleted && (!config.sync.lastSyncTimestamp || (config.sync.lastSyncTimestamp && config.sync.lastSyncTimestamp < cloudObject.createdAt) ))
                    return true;

                try{
                    var dataObject = new objectClass(objectData);
                    dataObject.cloudId = cloudObject.id;

                    promises.push(dataObject.save(true).then(function(){
                        dataObjects.push(dataObject);
                    }));
                }
                catch(e){
                    console.error("Can't create or save object: ", e);
                }
            });

            return $q.all(promises).then(function(){
                if (dataObjects.length)
                    eventBus.triggerEvent("updateObjects", { type: className, objects: dataObjects});

                return dataObjects;
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

        var userSettings = users.getCurrentUser().attributes.settings;
        if (userSettings){
            if (config.saveLocalization(userSettings))
                eventBus.triggerEvent("settingsChange", { fromCloud: true });
        }

        return syncObjectsFromCloud("Player").then(function(players){
            Player.updatePlayers(players);
            return syncObjectsFromCloud("Entry").then(setLastUpdateTime);
        });
    }

    function syncToCloud(){
        if (!cloudEnabled)
            return;

        var promises = [Entry, Player].map(function(dataObjectClass){
            return dataObjectClass.getAll({ unsynced: true, includeDeleted: true}).then(function(unsyncedDataObjects){
                if (unsyncedDataObjects.length){
                    var dataObjectsToSave = [];
                    unsyncedDataObjects.forEach(function(dataObject){
                        dataObjectsToSave.push(dataObject.getCloudData());
                    });

                    storage.setItems(dataObjectClass.name, dataObjectsToSave).then(function(savedData){
                        savedData.forEach(function(dataObjectCloudData, i){
                            var dataObject = unsyncedDataObjects[i];
                            dataObject.cloudId = dataObjectCloudData.id;
                            dataObject.save(true);

                            syncImageToCloud(dataObject).then(function(uploaded){
                                dataObject.save();
                            });
                        });

                        eventBus.triggerEvent("updateObjects", { type: dataObjectClass.name, objects: unsyncedDataObjects });
                    }, function(error){
                        console.error("ERROR syncing " + dataObjectClass.name + " objects: ", error);
                    });
                }
            })
        });

        return $q.all(promises);
    }

    function sync(params){
        if (!cloudEnabled || isSyncing)
            return;

        isSyncing = true;
        eventBus.triggerEvent("loadingStart", params);

        Player.getAll().then(function(){
            syncFromCloud().then(function(){
                syncToCloud().then(function(){
                    isSyncing = false;
                    eventBus.triggerEvent("loadingEnd", params);
                }, function(error){
                    isSyncing = false;
                    eventBus.triggerEvent("loadingEnd", angular.extend({ error: "Error syncing to cloud: " + error.message }, params));
                });
            }, function(error){
                isSyncing = false;
                eventBus.triggerEvent("loadingEnd", angular.extend({ error: "Error syncing from cloud: " + error.message }, params));
            });
        });
    }
}]);