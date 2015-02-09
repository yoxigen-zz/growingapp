define(["angular"], function(angular){
    return angular.module("ToggleDisplay", []).directive("toggleDisplay", ["$timeout", function($timeout){
        var TOGGLE_TIMEOUT = 300,
            TOGGLE_CLASS = "visible",
            TOGGLE_ACTIVE_CLASS = "active";

        return {
            restrict: 'A',
            scope: {
                toggleDisplay: "=",
                toggleElement: "@"
            },
            link: function postLink(scope, element, attrs) {
                var toggleTimeout,
                    toggleElement = element[0];

                scope.$watch("toggleElement", function(elementSelector){
                    toggleElement = elementSelector ? element[0].querySelector(elementSelector) : element[0];
                });

                scope.$watch("toggleDisplay", function(isVisible){
                    $timeout.cancel(toggleTimeout);

                    if (isVisible){
                        element.addClass(TOGGLE_CLASS);

                        toggleTimeout = $timeout(function(){
                            toggleElement && toggleElement.classList.add(TOGGLE_ACTIVE_CLASS);
                        }, 1);
                    }
                    else{
                        toggleElement && toggleElement.classList.remove(TOGGLE_ACTIVE_CLASS);

                        toggleTimeout = $timeout(function(){
                            element.removeClass(TOGGLE_CLASS);
                        }, TOGGLE_TIMEOUT);
                    }
                });
            }
        }
    }]);
});