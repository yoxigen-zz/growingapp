(function(){
    'use strict';

    angular.module("Entries").factory("entriesModel", entriesModel);

    entriesModel.$inject = ["Entry", "DataObjectCollection", "eventBus"];

    function entriesModel(Entry, DataObjectCollection, eventBus){
        var entriesCollection = new DataObjectCollection(Entry);

        var settingEntries,
            removedEntryIndex,
            PAGE_SIZE = 10,
            currentPage = 0,
            editedEntry;

        return {
            addEntry: addEntry,
            get entries(){ return entriesCollection.items },
            get editedEntry(){ return editedEntry; },
            set editedEntry(entry){ editedEntry = entry; },
            removeEntry: removeEntry,
            //saveEntry: saveEntry,
            updateEntriesAfterUnitChange: updateEntriesAfterUnitChange
        };

        function addEntry(newEntry){
            entriesCollection.add(newEntry, true);
            sortEntries();
        }

        function removeEntry(entry){
            entriesCollection.remove(entry);
            eventBus.triggerEvent("deleteEntry", entry);

            if (entry === editedEntry)
                this.editedEntry = null;
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
    }
})();