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
            "components/base64-binary",
            "filters/filters.module",
            "services/phonegap",
            "services/parse",
            "services/storage",
            "services/users",
            "services/utils",
            "services/localization",
            "services/messages",
            "services/chart",
            "directives/toggle-display",
            "directives/on-scroll-to-bottom",
            "directives/dropdown/dropdown",
            "entries/teeth/directive/teeth.directive",
            "services/classes/icon",
            "services/classes/eventbus_class",
            "services/dbconfig",
            "services/classes/data_object_collection"
        ], function () {
            requirejs([
                "services/classes/entry_type",
                "modules/entries/entries_module"
            ], function () {
                requirejs([
                    "services/classes/data_object",
                    "services/classes/file_data",
                    "services/config",
                    "services/files",
                    "services/players",
                    "services/classes/entry",
                    "services/classes/player",
                    "services/classes/data_object_collection"
                ], function () {
                    requirejs([
                        "modules/dialogs/dialogs_module",
                        "services/images",
                        "services/entries",
                        "services/entries_model",
                        "insights/vaccines/vaccines"
                    ], function () {
                        requirejs([
                            "modules/dialogs/dialog_class",
                            "modules/dialogs/dialogs",
                            "modules/dialogs/dialog_directive",
                            "modules/dialogs/dialog_directives/dialog",
                            "modules/dialogs/dialog_directives/slide_dialog",
                            "services/insights",
                            "directives/charts/line_chart"
                        ], function () {
                            requirejs([
                                "services/classes/insight",
                                "app"
                            ], function () {
                                    requirejs([
                                        "services/eventbus",
                                        "services/cloud",
                                        "services/statistics",
                                        "services/navigation",

                                        "entries/teeth/teeth",
                                        "filters/pronoun",
                                        "filters/unit",
                                        "filters/tofixed",

                                        "controllers/main_controller",
                                        "controllers/edit_player_controller",
                                        "controllers/login_controller",
                                        "controllers/signup_controller",
                                        "entries/teeth/teeth_controller",
                                        "controllers/signup_controller",
                                        "controllers/signup_controller",

                                        "insights/linechart_controller",
                                        "insights/vaccines/vaccines_controller",

                                        "directives/fixed",
                                        "directives/background-image",
                                        "directives/is-rtl"
                                    ], function () {
                                        angular.bootstrap(document, ["GrowingApp"]);
                                    });
                                }
                            );
                        });
                    });
                });
            });
        });
    }
);