angular.module("Popup", ["EventBus"]).directive("popup", ["$timeout", "eventBus", function($timeout, eventBus){
    var TOGGLE_TIMEOUT = 300,
        TOGGLE_CLASS = "visible",
        TOGGLE_ACTIVE_CLASS = "active";

    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {
            popupTitle: "@",
            popupShow: "="
        },
        templateUrl: "scripts/directives/popup/popup.template.html",
        link: function postLink(scope, element, attrs) {
            var toggleTimeout,
                toggleElement = element[0];

            scope.$watch("$destroy", function(){
                window.removeEventListener("keydown", onKeyDown);
            });

            scope.$watch("popupShow", function(isVisible){
                $timeout.cancel(toggleTimeout);

                if (isVisible){
                    element.addClass(TOGGLE_CLASS);

                    toggleTimeout = $timeout(function(){
                        toggleElement && toggleElement.classList.add(TOGGLE_ACTIVE_CLASS);
                    }, 1);

                    /*
                    $timeout(function(){
                        var autoFocusElement = toggleElement.querySelector("[data-auto-focus]");
                        if (autoFocusElement) {
                            autoFocusElement.focus();
                            autoFocusElement.select && autoFocusElement.select();
                        }
                    }, 40);
                      */
                    window.addEventListener("keydown", onKeyDown);
                    eventBus.triggerEvent("popup.open", { closePopup: scope.closePopup.bind(this, null) });
                }
                else{
                    toggleElement && toggleElement.classList.remove(TOGGLE_ACTIVE_CLASS);

                    toggleTimeout = $timeout(function(){
                        element.removeClass(TOGGLE_CLASS);
                    }, TOGGLE_TIMEOUT);

                    window.removeEventListener("keydown", onKeyDown);
                    eventBus.triggerEvent("popup.close");
                }
            });

            scope.closePopup = function(e){
                if (!e || e.target === toggleElement || e.target.dataset.closesPopup)
                    scope.popupShow = false;
            };

            function onKeyDown(e){
                if (e.keyCode === 27) {
                    scope.$apply(function(){
                        scope.popupShow = false;
                    });
                }
            }
        }
    }
}]);