app.factory("cloud", ["$q", "eventBus", "Entry", "Player", "FileData", "Storage", "users", "config", function($q, eventBus, Entry, Player, FileData, Storage, users, config){

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
            $q.when(dataObject.getCloudData()).then(function(cloudData){
                storage.setItem(dataObject.constructor.name, cloudData).then(function(savedData){
                    dataObject.cloudId = savedData.id;
                    dataObject.save(true);
                    eventBus.triggerEvent("updateObjects", { type: dataObject.constructor.name, objects: [dataObject] });
                }, function(error){
                    console.error("ERROR syncing " + dataObject.constructor.name + " object: ", error);
                });
            }, function(error){
                console.error("Error syncing DataObject to cloud: ", error);
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

    function syncObjectsFromCloud(objectClass){
        var className = objectClass.name;
        return storage.query(className, config.sync.lastSyncTimestamp ? { greaterThan: ["updatedAt", config.sync.lastSyncTimestamp] } : null).then(function(results){
            if (!results || !results.length)
                return;

            var dataObjects = [],
                promises = [];

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

        return syncObjectsFromCloud(Player).then(function(players){
            Player.updatePlayers(players);
            return $q.all([syncObjectsFromCloud(Entry), syncObjectsFromCloud(FileData)]).then(setLastUpdateTime);
        });
    }

    /**
     * Saves all the unsynced local objects (those that have been saved to the local DB) to the cloud
     * This includes all DataObject types: Entries, Players, Files
     *
     * For each DataObject type does the following:
     * 1. Get all objects with unsycned == true
     * 2. Prepares an array of cloudData with all the unsynced objects
     * 3. Saves to the cloud (or fails) - uses the DataObject class name as cloud class name
     * 4. Add cloudId to all objects that are new to the cloud and save them.
     * 5. Triggers the 'updateObjects' event with the DataObject type and the saved objects.
     *
     * @returns {*}
     */
    function syncToCloud(){
        if (!cloudEnabled)
            return;

        var promises = [Entry, Player, FileData].map(function(dataObjectClass){
            return dataObjectClass.getAll({ unsynced: true, includeDeleted: true}).then(function(unsyncedDataObjects){
                if (unsyncedDataObjects.length){
                    var dataObjectsToSavePromises = unsyncedDataObjects.map(function(dataObject){
                        return $q.when(dataObject.getCloudData());
                    });

                    $q.all(dataObjectsToSavePromises).then(function(dataObjectsToSave){
                        storage.setItems(dataObjectClass.name, dataObjectsToSave).then(function(savedData){
                            savedData.forEach(function(dataObjectCloudData, i){
                                var dataObject = unsyncedDataObjects[i];
                                if (dataObject.cloudId !== dataObjectCloudData.id)
                                    dataObject.save(true);
                            });

                            eventBus.triggerEvent("updateObjects", { type: dataObjectClass.name, objects: unsyncedDataObjects });
                        }, function(error){
                            console.error("ERROR syncing " + dataObjectClass.name + " objects: ", error);
                        });
                    }, function(error){
                        console.error("Can't get objects to sync: ", error);
                    });
                }
            })
        });

        return $q.all(promises);
    }

    /**
     * General sync - saves from cloud to local, then from local to cloud.
     * @param params
     */
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