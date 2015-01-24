(function(){
    angular.module("GrowingApp").factory("thumbnailsCreate", thumbnailsCreate);

    thumbnailsCreate.$inject = ["$q", "images", "Entry", "Player", "eventBus", "$timeout", "messages"];

    function thumbnailsCreate($q, images, Entry, Player, eventBus, $timeout, messages){
        function create() {
            Player.getAll().then(function (players) {
                players.forEach(function (player) {
                    Entry.getEntries({ type: "photo", playerId: player.playerId }).then(function (entries) {
                        var promises = [];

                        $timeout(function(){
                            entries.forEach(function (entry) {
                                if (entry.image && entry.image.localUrl && !entry.image.localThumbnailUrl) {
                                    promises.push(images.addThumbnailToDataObject(entry.image));
                                }
                            });

                            alert("updating promises " + promises.length);

                            if (promises.length) {
                                alert("found " + promises.length + " entries to upate.");
                                $q.all(promises).then(function () {
                                    alert("updating thumbnails for " + promises.length + " entries.");
                                    eventBus.triggerEvent("sync");
                                }, function(error){
                                    messages.error("ERROR updating thubmanils", error);
                                });
                            }
                        },3000)
                    });
                });
            });
        }

        return {
            create: create
        }
    }
})();