app.directive("isRtl", ["utils", function(utils){
    return {
        restrict: 'A',
        scope: {
            isRtl: "="
        },
        link: function postLink(scope, element, attrs) {
            var el = element[0],
                isRtl;

            if (el.nodeName === "INPUT" || el.nodeName === "TEXTAREA"){
                el.addEventListener("keyup", onKeyUp);
            }

            scope.$on("$destroy", function(){
                el.removeEventListener("keyup", onKeyUp);
            });

            scope.$watch("isRtl", function(value){
                if (value)
                    el.classList.add("rtl");
                else
                    el.classList.remove("rtl");

                isRtl = value;
            });

            function onKeyUp(e){
                var value = e.target.value;

                var _isRtl = utils.strings.isRtl(value);
                if (_isRtl){
                    if (!isRtl)
                        el.classList.add("rtl");
                }
                else {
                    if (isRtl)
                        el.classList.remove("rtl");
                }

                isRtl = _isRtl;
            }
        }
    }
}]);