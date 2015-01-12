(function(){
    'use strict';

    angular.module("Entries").factory("entriesModel", ["Entry", "DataObjectCollection", "eventBus", function(Entry, DataObjectCollection, eventBus){
        var entriesCollection = new DataObjectCollection(Entry);

        var settingEntries,
            removedEntryIndex,
            PAGE_SIZE = 10,
            currentPage = 0,
            editedEntry;

        return {
            get entries(){ return entriesCollection.items },
            get editedEntry(){ return editedEntry; },
            set editedEntry(entry){ editedEntry = entry; },
            removeEntry: removeEntry,
            saveEntry: saveEntry,
            unremoveEntry: unremoveEntry
        };

        function removeEntry(entry){
            entriesCollection.remove(entry);
            eventBus.triggerEvent("deleteEntry", entry);

            if (entry === editedEntry)
                this.editedEntry = null;
        }
    }]);
})();