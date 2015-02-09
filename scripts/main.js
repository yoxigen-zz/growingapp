requirejs.config({
    baseUrl: 'scripts',
    paths: {
        components: "../components",
        parse: "../components/parse",
        d3: "../components/d3",
        moment: "../components/moment",
        angular: "../components/angular/angular.min",
        insights: "../insights",
        classes: "services/classes"
    },
    shim: {
        angular: {
            exports: 'angular'
        },
        parse: {
            exports: "Parse"
        },
        d3: {
            exports: "d3"
        },
        "components/angular/angular-touch.min": {
            deps: ["angular"]
        },
        "components/angular/angular-route.min": {
            deps: ["angular"]
        },
        moment: {
            exports: "moment"
        }
    }
});

requirejs([
        "app"
    ], function () {
        requirejs([
            "services/cloud",
            "services/statistics",
            "services/navigation",

            "entries/teeth/teeth",
            "filters/pronoun",
            "filters/unit",
            "filters/tofixed",

            "controllers/main_controller",
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