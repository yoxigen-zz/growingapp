app.constant("dbConfig", {
    objectStores: {
        entries: "entries",
        players: "players"
    }
});

app.factory("config", ["utils", function(utils){
    var entries = {
        milestone: {
            types: [
                { id: "smile", text: "Smiled for the first time! :)" },
                { id: "laughter", text: "Laughed for the first time! :D" },
                { id: "crawling", text: "Has started crawling!" },
                { id: "word", text: "Said:" },
                { id: "potty", text: "Used the potty for the first time!" },
                { id: "walking", text: "Started walking!" }
            ]
        }
    };

    entries.milestone.typesIndex = utils.arrays.toIndex(entries.milestone.types, "id");

    return {
        entries: entries,
        localization: {
            height: {
                all: ["cm", "inches"],
                selected: "cm"
            },
            weight: {
                all: ["kg", "lb"],
                selected: "kg"
            }
        }
    }
}]);