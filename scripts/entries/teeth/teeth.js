define(["app", "classes/entry"], function (app) {
    'use strict';

    app.factory("teeth", teeth);

    teeth.$inject = ["$q", "Entry", "eventBus"];
    function teeth($q, Entry, eventBus) {
        var addedTeeth;

        eventBus.subscribe("saveEntry", function(entry){
            if (entry.type.id === "teeth")
                addedTeeth = null;
        });

        return {
            getAllAddedTeeth: function(playerId){
                if (addedTeeth)
                    return $q.when(addedTeeth);

                return Entry.getEntries({
                    playerId: playerId,
                    type: "teeth"
                }).then(function(teethEntries){
                    var teeth = [];
                    teethEntries.forEach(function(entry){
                        teeth.push(entry.properties.tooth);
                    });
                    addedTeeth = teeth;
                    return addedTeeth;
                });
            }
        }
    }
});