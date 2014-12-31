requirejs.config({
    baseUrl: 'scripts',
    paths: {
        components: '../components',
        insights: "../insights"
    }
});

// Start the main app logic.
requirejs([
        "components/d3",
        "components/parse",
        "components/moment",
        "components/angular/angular.min"
    ],
    function (ignore) {
        window.d3 = require('components/d3');

        requirejs([
            "components/angular/angular-touch.min",
            "components/angular/angular-route.min",
            "components/indexeddb",
            "filters/filters.module",
            "services/phonegap",
            "services/parse",
            "services/storage",
            "services/users",
            "services/eventbus",
            "services/utils",
            "services/localization",
            "services/messages",
            "services/classes/dialog",
            "services/chart",
            "directives/toggle-display",
            "entries/teeth/directive/teeth.directive",
            "services/dbconfig"
        ], function () {
            requirejs([
                "services/classes/data_object",
                "services/classes/file_data",
                "services/files"
            ], function () {
                requirejs([
                    "services/images",
                    "directives/dialogs/dialog",
                    "directives/dialogs/slide_dialog"
                ], function () {
                    requirejs([
                            "directives/charts/line_chart",
                            "app"
                        ], function () {
                            requirejs([
                                "services/config",
                                "services/classes/entry",
                                "services/classes/player",
                                "services/classes/entry_type",
                                "services/entries",
                                "services/insights",
                                "services/cloud",
                                "services/statistics",
                                "services/navigation",

                                "entries/teeth/teeth",
                                "filters/pronoun",
                                "filters/unit",
                                "filters/tofixed",

                                "controllers/main_controller",
                                "controllers/edit_player_controller",
                                "controllers/insights_controller",
                                "controllers/entries_list_controller",
                                "controllers/login_controller",
                                "controllers/signup_controller",
                                "entries/teeth/teeth_controller",
                                "controllers/signup_controller",
                                "controllers/signup_controller",

                                "insights/linechart_controller",

                                "directives/fixed",
                                "directives/background-image"
                            ], function () {
                                angular.bootstrap(document, ["GrowingApp"]);
                            });
                        }
                    );
                });
            });
        });
    }
);