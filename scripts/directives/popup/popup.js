angular.module("Popup", []).directive("popup", ["$timeout", function($timeout){
    var TOGGLE_TIMEOUT = 300,
        TOGGLE_CLASS = "visible",
        TOGGLE_ACTIVE_CLASS = "active";

    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {
            title: "@",
            popupShow: "="
        },
        templateUrl: "scripts/directives/popup/popup.template.html",
        link: function postLink(scope, element, attrs) {
            var toggleTimeout,
                toggleElement = element[0];

            scope.$watch("popupShow", function(isVisible){
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

            scope.closePopup = function(e){
                if (!e || e.target === toggleElement || e.target.dataset.closesPopup)
                    scope.popupShow = false;
            };
        }
    }
}]);