angular.module("Teeth", []).directive("teeth", function(){
    return {
        restrict: 'E',
        templateUrl: "scripts/directives/teeth/teeth.template.html",
        replace: true,
        require: '?ngModel',
        link: function postLink(scope, element, attrs, ngModel) {
            var selectedToothElement,
                svg = element[0];

            ngModel.$render = function() {
                var toothId = ngModel.$viewValue,
                    toothElement = svg.querySelector("#" + toothId);

                selectTooth(toothElement);
            };

            svg.addEventListener("click", function(e){
                var isShadow;

                if (e.target.classList.contains("tooth") || (isShadow = e.target.classList.contains("shadow"))) {
                    scope.$apply(function(){
                        var toothElement = isShadow ? svg.querySelector("#" + e.target.dataset.tooth) : e.target;
                        selectTooth(toothElement, true);
                    });
                }
            });

            function selectTooth(toothElement, setModel){
                if (selectedToothElement)
                    selectedToothElement.classList.remove("selected");

                if (!toothElement) {
                    selectedToothElement = null;
                    return false;
                }

                toothElement.classList.add("selected");
                selectedToothElement = toothElement;

                if (setModel)
                    ngModel.$setViewValue(toothElement.id);
            }
        }
    };
});