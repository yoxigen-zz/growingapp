app.directive("isRtl", [function(){
    return {
        restrict: 'A',
        scope: {
            isRtl: "="
        },
        link: function postLink(scope, element, attrs) {
            var el = element[0];

            scope.$watch("isRtl", function(value){
                el.style.direction = value ? "rtl" : "ltr";
                el.style.textAlign = value ? "right" : null;
            });
        }
    }
}]);