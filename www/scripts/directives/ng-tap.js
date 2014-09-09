(function(){
    var tapModule = angular.module("Tap", []),
        swipeEvents = ["swipeLeft", "swipeRight", "swipeUp", "swipeDown"];

    tapModule.directive("ngTap", ["$rootScope", function($rootScope){
        return {
            restrict: 'A',
            scope: {
                ngTap: "&"
            },
            link: function postLink(scope, element, attrs) {
                element[0].addEventListener("tap", function(e){
                    if (e.originalEvent.button === 2)
                        return true;

                    $rootScope.$apply(function(){
                        scope.ngTap({ $event: e });
                    });
                });
            }
        }
    }]);

    swipeEvents.forEach(function(swipeEvent){
        tapModule.directive(swipeEvent, ["$rootScope", function($rootScope){
            var directiveScope = {};
            directiveScope[swipeEvent] = "&";

            return {
                restrict: 'A',
                scope: directiveScope,
                link: function postLink(scope, element, attrs) {
                    element[0].addEventListener(swipeEvent.toLowerCase(), function(e){
                        if (e.originalEvent.button === 2)
                            return true;

                        $rootScope.$apply(function(){
                            scope[swipeEvent]({ $event: e });
                        });
                    });
                }
            }
        }]);
    });
})();