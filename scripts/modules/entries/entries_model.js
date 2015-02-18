define(["angular", "modules/entries/entries_module"], function(angular){
    'use strict';

    angular.module("Entries").factory("entriesModel", entriesModel);

    entriesModel.$inject = ["Entry", "DataObjectCollection", "eventBus", "EventBus", "players", "EntryType", "messages", "config", "dialogs", "$rootScope"];

    /**
     * The model object for entries - responsible for holding entries and supplies methods for adding, removing, editing, etc.
     * @returns {{allEntriesAdded: boolean, addEntry: addEntry, currentEntriesType, currentEntriesType, editEntry: editEntry, editedEntry: null, items: Array, getEntries: getEntries, loadMoreEntries: loadMoreEntries, newEntry: newEntry, removeEntry: removeEntry, setEntries: setEntries, settingEntries: boolean, unremoveLastEntry: unremoveLastEntry, updateEntriesAfterUnitChange: updateEntriesAfterUnitChange}}
     */
    function entriesModel(Entry, DataObjectCollection, eventBus, EventBus, players, EntryType, messages, config, dialogs, $rootScope){
        var entriesCollection = new DataObjectCollection(Entry);

        var PAGE_SIZE = 10,
            currentPage = 0,
            currentEntriesType,
            editedEntry,// this is the original edited entry.
            lastRemovedEntry,
            lastRemovedEntryIndex;

        var SAVE_ENTRY_EVENT = "saveEntry";
        var innerEventBusEvents = {
            newEntry: "newEntry",
            removeEntry: "removeEntry",
            updateEntry: "updateEntry"
        };

        eventBus.subscribe(["editPlayer", "playerSelect"], setEntries);
        eventBus.subscribe("settingsChange", setEntries);
        eventBus.subscribe("updateObjects", function onUpdateObjects(e){
            if (e.type === "Entry")
                onUpdateEntries(e.objects)
        });

        eventBus.subscribe("logout", function(){
            api.currentEntriesType = null;
            entriesCollection = new DataObjectCollection(Entry);
            api.items = entriesCollection.items;
        });

        dialogs.editEntry.submitAction = { icon: "ok", title: "Save entry", onSubmit: entrySaveAction };

        var api = {
            allEntriesAdded: false,
            addEntry: addEntry,
            get currentEntriesType(){
                return currentEntriesType || "";
            },
            set currentEntriesType(type){
                if (!type)
                    currentEntriesType = null;
                else if (!(type instanceof EntryType))
                    throw new TypeError("Invalid entry type, expected an instance of EntryType.");

                currentEntriesType = type;
            },
            editEntry: editEntry,
            editedEntry: null, // set a copy of an entry as editedEntry to edit it. NOT the original, so changes have to be saved before taking place.
            items: entriesCollection.items,
            getEntries: getEntries,
            loadMoreEntries: loadMoreEntries,
            newEntry: newEntry,
            removeEntry: removeEntry,
            setEntries: setEntries,
            settingEntries: false, // set this to true while entries are loading
            unremoveLastEntry: unremoveLastEntry,
            updateEntriesAfterUnitChange: updateEntriesAfterUnitChange
        };

        setEntries();

        var entriesModelEventBus = EventBus.setToObject(api, [innerEventBusEvents.newEntry, innerEventBusEvents.removeEntry, innerEventBusEvents.updateEntry]);

        return api;

        function entrySaveAction(){
            api.editedEntry.save().then(function(savedEntry){
                dialogs.editEntry.close();
                dialogs.newEntry.close();
                if (savedEntry.isNew) {
                    addEntry(savedEntry);
                    eventBus.triggerEvent(SAVE_ENTRY_EVENT, savedEntry);
                    entriesModelEventBus.triggerEvent(innerEventBusEvents.newEntry, savedEntry);
                }
                else {
                    entriesCollection.updateItem(savedEntry);
                    sortEntries();
                    eventBus.triggerEvent(SAVE_ENTRY_EVENT, api.editedEntry);
                    entriesModelEventBus.triggerEvent(innerEventBusEvents.updateEntry, api.editedEntry);
                }
            }, function(error){
                messages.error("Couldn't save entry", error);
            });
        }

        function addEntry(newEntry){
            entriesCollection.add(newEntry, true);
            sortEntries();
            if (!config.sync.lastSyncTimestamp && !config.sync.synOfferDeclined && entriesCollection.size >= config.sync.syncOfferEntryCount)
                dialogs.syncOffer.open();
        }

        function removeEntry(){

            lastRemovedEntry = editedEntry;
            lastRemovedEntryIndex = entriesCollection.remove(editedEntry).index;

            eventBus.triggerEvent("deleteEntry", editedEntry);
            entriesModelEventBus.triggerEvent(innerEventBusEvents.removeEntry, editedEntry);

            api.editedEntry = null;

            dialogs.editEntry.close();
            dialogs.unremoveEntry.open();

            // TODO: Create a directive for this
            setTimeout(function(){
                document.body.addEventListener("mousedown", onClickAfterRemove);
            }, 50);
        }

        function unremoveLastEntry(){
            if (!lastRemovedEntry)
                return false;

            lastRemovedEntry.unremove();
            eventBus.triggerEvent(SAVE_ENTRY_EVENT, lastRemovedEntry);
            entriesCollection.items.splice(lastRemovedEntryIndex, 0, lastRemovedEntry);
            dialogs.unremoveEntry.close();
            lastRemovedEntry = null;
        }

        // TODO: Create a directive for this
        function onClickAfterRemove(e){
            if (e.target.id !== "undoEntryRemove") {
                $rootScope.$apply(dialogs.unremoveEntry.close);
                document.body.removeEventListener("mousedown", onClickAfterRemove);
            }
        }

        function editEntry(entry, isNewEntry){
            editedEntry = isNewEntry ? null : entry;
            api.editedEntry = isNewEntry ? entry : new Entry(entry).prepareForEdit();
            dialogs.editEntry.actions = isNewEntry ? [] : [{ icon: "trash", title: "Delete entry", onClick: removeEntry }];

            dialogs.editEntry.open();
        }

        function newEntry(entryType){
            dialogs.newEntry.close();
            editEntry(new Entry(entryType, players.currentPlayer, true));
        }

        function updateEntriesAfterUnitChange(unitType) {
            entriesCollection.items.forEach(function (entry) {
                if (entry.type.localizationDependencies && ~entry.type.localizationDependencies.indexOf(unitType))
                    entry.clearParsedValues();
            });
        }

        function sortEntries(){
            entriesCollection.items.sort(function(a, b){
                if (a.date === b.date)
                    return 0;

                return a.date < b.date ? 1 : -1;
            });
        }

        function loadMoreEntries(){
            currentPage++;
            getEntries();
        }

        function setEntries(){
            if (players.currentPlayer && players.currentPlayer.playerId) {
                api.allEntriesAdded = false;
                currentPage = 0;
                entriesCollection.clearItems();
                getEntries();
            }
            else {
                api.settingEntries = false;
                entriesCollection.clearItems();
            }
        }

        function getEntries(){
            if (api.settingEntries)
                return;

            api.loading = true;

            api.settingEntries = true;
            var getOptions = {
                count: PAGE_SIZE,
                offset: currentPage * PAGE_SIZE,
                type: currentEntriesType && currentEntriesType.id,
                playerId: players.currentPlayer.playerId,
                reverse: true
            };

            Entry.getEntries(getOptions).then(function (entries) {
                if (api.settingEntries) {
                    entries.forEach(function(entry){
                        entriesCollection.add(entry);
                    });

                    if (entries.length < PAGE_SIZE)
                        api.allEntriesAdded = true;
                }
            }).finally(function(){
                api.settingEntries = false;
            }).catch(function(error){
                entriesCollection.clearItems();
                messages.error("Error getting entries: ", error);
            });
        }

        function onUpdateEntries(entries){
            var updatedEntriesIndex = {},
                handled = 0;

            var currentPlayerId = players.currentPlayer.playerId;

            entries.forEach(function(entry){
                if (entry.player.playerId !== currentPlayerId)
                    return true;

                if (entry.isNew) {
                    // If the entry doesn't exists AND it's newer than the last entry in the current collection, add it.
                    // Otherwise, it'll be retrieved when paging.
                    if (!entriesCollection.hasItem(entry) && (!entriesCollection.size || entry.date > entriesCollection.items[entriesCollection.items.length - 1].date))
                        entriesCollection.add(entry);

                    handled++;
                }
                else
                    updatedEntriesIndex[entry.timestamp] = entry;
            });

            // Remove deleted entries:
            var indexEntry;
            for(var i= 0, entry; i < entriesCollection.items.length; i++){
                entry = entriesCollection.items[i];
                if (indexEntry = updatedEntriesIndex[entry.timestamp]){
                    if (!indexEntry.isNew) {
                        if (indexEntry._deleted)
                            entriesCollection.items.splice(i, 1);
                        else
                            entriesCollection.items[i] = indexEntry;
                    }
                    handled++;
                    if (handled === entries.length)
                        break;
                }
            }

            sortEntries();
        }
    }
});