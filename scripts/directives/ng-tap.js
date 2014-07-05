angular.module("Tap", []).directive("ngTap", ["$rootScope", function($rootScope){
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