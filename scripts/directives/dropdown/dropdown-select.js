define(["angular", "directives/dropdown/dropdown"], function(angular, dropdown){
    "use strict";

    dropdown.directive("dropdownSelect", dropdownSelect);

    function dropdownSelect(){
        return {
            restrict: "E",
            replace: true,
            require: "?ngModel",
            scope: {
                selectText: "@",
                items: "=",
                itemLabel: "@",
                itemValue: "@",
                itemIcon: "@"
            },
            template: '<dropdown button-text="{{selectText}}" close-on-click="true"><ul class="dropdown-list"><li ng-repeat="item in parsedItems">{{item.label}}</li></ul></dropdown>',
            link: dropdownSelectLink
        };

        function dropdownSelectLink(scope, element, attrs, ngModel){
            var list = element[0].querySelector("ul");

            list.addEventListener("click", function(e){
                console.log("click: ", e);
            });

            scope.$watch("items", function(options){
                var parsedItems = [];

                if (scope.items && scope.items.constructor === Array){
                    parsedItems = scope.items.map(function(item){
                        if (Object(item) === item){
                            return {
                                label: scope.itemLabel ? item[scope.itemLabel] : item[scope.itemValue],
                                value: scope.itemValue ? item[scope.itemValue] : item
                            };
                        }
                        else
                            return { label: item, value: item };
                    });
                }

                scope.parsedItems = parsedItems;
            });
        }
    }
});