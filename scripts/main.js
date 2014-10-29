requirejs.config({
    baseUrl: 'scripts',
    paths: {
        components: '../components',
        insights: "../insights"
    }
});

// Start the main app logic.
requirejs([
        "components/parse",
        "components/angular/angular.min"
    ],
    function   () {
        requirejs([
            "components/angular/angular-touch.min",
            "components/angular/angular-route.min",
            "components/indexeddb",
            "services/phonegap",
            "services/parse",
            "services/storage",
            "services/users",
            "services/eventbus",
            "services/utils",
            "services/chart",
            "directives/self-click",
            "directives/toggle-display",
            "directives/popup/popup",
            "entries/teeth/directive/teeth.directive"
        ], function(){
            requirejs([
                "directives/charts/line_chart",
                "app"
                ]
                ,function(){
                    requirejs([
                        "services/config",
                        "services/classes/data_object",
                        "services/classes/entry",
                        "services/classes/player",
                        "services/entries",
                        "services/insights",
                        "services/cloud",
                        "services/statistics",
                        "services/navigation",

                        "entries/teeth/teeth",
                        "filters/pronoun",

                        "controllers/main_controller",
                        "controllers/edit_player_controller",
                        "controllers/insights_controller",
                        "controllers/entries_list_controller",
                        "controllers/login_controller",
                        "controllers/signup_controller",
                        "entries/teeth/teeth_controller",
                        "controllers/signup_controller",
                        "controllers/signup_controller",

                        "insights/linechart_controller"
                    ], function(){
                        angular.bootstrap(document, ["GrowingApp"]);
                        require(['components/d3'], function(ignore)    {
                            d3 = require('components/d3');
                        });
                    });
                }
            );
        });
    }
);