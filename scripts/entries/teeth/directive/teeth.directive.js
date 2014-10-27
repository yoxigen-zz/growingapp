angular.module("Teeth", []).directive("teeth", function(){
    return {
        restrict: 'E',
        templateUrl: "scripts/entries/teeth/directive/teeth.template.html",
        replace: true,
        require: '?ngModel',
        scope: {
            highlightedTeeth: "="
        },
        link: function postLink(scope, element, attrs, ngModel) {
            var selectedToothElement,
                svg = element[0],
                teethElements;

            ngModel.$render = function() {
                var toothId = ngModel.$viewValue,
                    toothElement = svg.querySelector("#" + toothId);

                selectTooth(toothElement);
            };

            scope.$watch("highlightedTeeth", function(highlightedTeeth){
                if (!highlightedTeeth)
                    return;

                if (!teethElements)
                    teethElements = svg.querySelectorAll(".tooth");

                for(var i= 0, tooth; tooth = teethElements[i]; i++){
                    if (!~highlightedTeeth.indexOf(tooth.id))
                        tooth.classList.remove("highlighted");
                    else
                        tooth.classList.add("highlighted");
                }
            });

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