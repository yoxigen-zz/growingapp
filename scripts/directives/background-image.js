define(["app"], function(app) {
    "use strict";

    app.directive("backgroundImage", backgroundImage);

    function backgroundImage() {
        return {
            restrict: 'A',
            scope: {
                backgroundImage: "="
            },
            link: function postLink(scope, element, attrs) {
                var el = element[0],
                    lastValue;

                scope.$watch("backgroundImage", function(value){
                    if (value)
                        el.style.backgroundImage = "url(" + value + ")";
                    else if (lastValue)
                        el.style.removeProperty("background-image");

                    lastValue = value;
                });
            }
        }
    }
});