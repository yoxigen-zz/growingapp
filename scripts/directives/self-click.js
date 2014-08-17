angular.module("SelfClick", []).directive("selfClick", ["$parse", function($parse){
    return {
        restrict: 'A',
        link: function postLink(scope, element, attrs) {
            var onClick = $parse(attrs.selfClick);

            element.on("click", function(e){
                if (e.target === e.currentTarget) {
                    scope.$apply(function () {
                        onClick(scope, { $event: e });
                    });
                }
            });
        }
    }
}]);