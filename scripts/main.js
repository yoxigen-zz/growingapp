define(function(){
    requirejs.config({
        baseUrl: 'scripts',
        enforceDefine: true,
        urlArgs: "bust=" +  (new Date()).getTime(),
        paths: {
            components: "../components",
            parse: "../components/parse",
            d3: "../components/d3",
            moment: "../components/moment",
            angular: "../components/angular/angular.min",
            "angularTouch": "../components/angular/angular-touch.min",
            "angularRoute": "../components/angular/angular-route.min",
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
            "angularTouch": {
                exports: "angular",
                deps: ["angular"]
            },
            "angularRoute": {
                exports: "angular",
                deps: ["angular"]
            },
            moment: {
                exports: "moment"
            }
        }
    });

    requirejs([
            "components/polyfills/classlist",
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
});