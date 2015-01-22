app.factory("cloud", ["$q", "eventBus", "Entry", "Player", "FileData", "Storage", "users", "config", "messages", "files",
    function($q, eventBus, Entry, Player, FileData, Storage, users, config, messages, files){

    var storage = new Storage().cloud,
        cloudEnabled,
        isSyncing;

    eventBus.subscribe(["saveEntry", "deleteEntry", "editPlayer", "deletePlayer"], syncDataObjectToCloud);
    eventBus.subscribe("login", onLogin);
    eventBus.subscribe("logout", function(){ cloudEnabled = false; });
    eventBus.subscribe("sync", sync);
    eventBus.subscribe("settingsChange", syncSettingsToCloud);

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

    /**
     * Saves changes to a single dataObject to cloud - create, update or delete.
     * @param dataObject
     */
    function syncDataObjectToCloud(dataObject){
        if (!cloudEnabled)
            return;

        return syncImageToCloud(dataObject).then(function(uploaded){
            $q.when(dataObject.getCloudData()).then(function(cloudData){
                storage.setItem(dataObject.constructor.name, cloudData).then(function(savedData){
                    // If it's a newly created object, save the cloudId locally:
                    if (dataObject.cloudId !== savedData.id) {
                        dataObject.cloudId = savedData.id;
                        dataObject.save(true);
                    }

                    eventBus.triggerEvent("updateObjects", { type: dataObject.constructor.name, objects: [dataObject] });
                }, function(error){
                    messages.error("ERROR syncing " + dataObject.constructor.name + ". Error: " + JSON.stringify(error));
                });
            }, function(error){
                messages.error("Error syncing DataObject to cloud: " + JSON.stringify(error));
            });
        });
    }

    /**
     * Saves local user settings to cloud.
     * @param e
     */
    function syncSettingsToCloud(e){
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
            return syncDataObjectToCloud(dataObject.image);
        }

        return $q.when(false);
    }

    /**
     * For the specified DataObject class, gets all the new or updated objects from cloud, then adds cloudIds where required and saves the changes locally.
     * When all objects have been saved, triggers an 'updateObjects' event, with the dataObject type and the updated objects.
     * @param objectClass The constructor for the required DataObject type (Entry, Player, FileData...)
     * @returns {*}
     */
    function syncObjectsFromCloud(objectClass){
        var className = objectClass.name;
        return storage.query(className, config.sync.lastSyncTimestamp ? { greaterThan: ["updatedAt", config.sync.lastSyncTimestamp] } : null, { limit: 1000 }).then(function(results){
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
                    objectData.cloudId = cloudObject.id;
                    delete cloudObject.id;

                    var dataObject = new objectClass(objectData);
                    dataObject.cloudId = objectData.cloudId;

                    promises.push(dataObject.save(true).then(function(){
                        dataObjects.push(dataObject);
                    }));
                }
                catch(e){
                    messages.error("Can't create or save object: ", e);
                }
            });

            return $q.all(promises).then(function(){
                if (dataObjects.length)
                    eventBus.triggerEvent("updateObjects", { type: className, objects: dataObjects});

                if (objectClass.syncFiles)
                    dataObjects.forEach(downloadFile);

                return dataObjects;
            }, function(error){
                messages.error(error);
            });
        }, function(error){
            messages.error("Can't fetch " + className + " data from cloud. Error: ", error);
            return $q.reject(error);
        });
    }

    function downloadFile(dataObject){
        if (dataObject.requireDownload){
            if (!dataObject.cloudUrl) {
                delete dataObject.requireDownload;
                dataObject.save(true);
                return null;
            }
            else {
                var fileDownloadPromise = files.download(dataObject.cloudUrl, dataObject.constructor.name, dataObject.id).then(function(fileEntry){
                    dataObject.setLocalUrl(fileEntry.fullPath);
                });

                var promises = [fileDownloadPromise];

                if (dataObject.cloudThumbnailUrl){
                    var thumbnailDownloadPromise = files.download(dataObject.cloudThumbnailUrl, "thumbnails", dataObject.id).then(function(fileEntry){
                        dataObject.localThumbnailUrl = fileEntry.fullPath;
                    });

                    promises.push(thumbnailDownloadPromise);
                }

                return $q.all(promises).then(function(){
                    dataObject.save(true);
                    eventBus.triggerEvent("updateFile", { dataObject: dataObject });
                    return dataObject;
                }).catch(function(error){
                    messages.error(error);
                });
            }
        }
    }

    function setLastUpdateTime(){
        config.sync.lastSyncTimestamp = new Date();
    }

    function syncFromCloud(){
        if (!cloudEnabled)
            return;

        syncUserSettings();


        // Both Player and Entry objects need updates to files, so FileData comes first.
        // Entry needs updates to Players (entry for a new player, for example), so Player comes second and Entry last, it has no dependencies.
        return syncObjectsFromCloud(FileData).then(function(){
            return syncObjectsFromCloud(Player).then(function(players){
                Player.updatePlayers(players);

                return syncObjectsFromCloud(Entry).then(setLastUpdateTime);
            });
        });
    }

    /**
     * If the current logged-in user's settings are different than the local user settings, updates the local user settings and trigger a 'settingsChange' event.
     */
    function syncUserSettings(){
        var userSettings = users.getCurrentUser().attributes.settings;
        if (userSettings){
            if (config.saveLocalization(userSettings))
                eventBus.triggerEvent("settingsChange", { fromCloud: true });
        }
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