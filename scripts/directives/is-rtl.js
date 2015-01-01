app.directive("isRtl", [function(){
    return {
        restrict: 'A',
        scope: {
            isRtl: "="
        },
        link: function postLink(scope, element, attrs) {
            var el = element[0];

            scope.$watch("isRtl", function(value){
                if (value)
                    el.classList.add("rtl");
                else
                    el.classList.remove("rtl");
            });
        }
    }
}]);