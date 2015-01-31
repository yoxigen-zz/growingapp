(function(){
    angular.module("Dropdown", []).directive("dropdown", ["$timeout", function($timeout){
        return {
            replace: true,
            restrict: "E",
            transclude: true,
            scope: {
                buttonText: "@",
                buttonClass: "@",
                buttonIcon: "@",
                closeOnClick: "="
            },
            template: '<div class="dropdown-directive"><button ng-click="open()" class="dropdown-directive-button {{buttonClass}}"><img ng-if="buttonIcon" ng-src="{{buttonIcon}}" />{{buttonText}}</button>' +
                '<div class="dropdown-directive-menu" ng-transclude></div></div>',
            link: dropdownLink
        };

        function dropdownLink(scope, element, attrs){
            var dropdownEl = element[0],
                menuEl = dropdownEl.querySelector(".dropdown-directive-menu"),
                buttonEl = dropdownEl.querySelector("button");

            var addMouseUpTimeout,
                setMenuPositionTimeout;

            var MARGIN = 16;

            scope.open = open;

            function open(){
                dropdownEl.classList.add("dropdown-open");
                setMenuPositionTimeout = setTimeout(setMenuPositionAndShow);
                window.addEventListener("resize", close);
                scope.isOpen = true;
                document.addEventListener("backbutton", close);
            }
            function close(){
                clearTimeout(addMouseUpTimeout);
                clearTimeout(setMenuPositionTimeout);

                dropdownEl.classList.remove("dropdown-visible");
                $timeout(function(){
                    dropdownEl.classList.remove("dropdown-open");
                    menuEl.style.removeProperty("height");
                    menuEl.style.removeProperty("width");
                });
                document.body.removeEventListener("mousedown", onMouseDown);
                window.removeEventListener("resize", close);
                menuEl.removeEventListener("click", close);
                document.removeEventListener("backbutton", close);
                scope.isOpen = false;
            }

            function onMouseDown(e){
                var el = e.target;
                do{
                    if (el === document.documentElement)
                        return close();

                    if (el === menuEl)
                        return true;
                }
                while(el = el.parentNode);
            }

            function setMenuPositionAndShow(){
                var buttonRect = buttonEl.getBoundingClientRect();

                menuEl.style.top = buttonRect.top + "px";
                menuEl.style.left = buttonRect.left + "px";

                var documentWidth = document.documentElement.clientWidth,
                    documentHeight = document.documentElement.clientHeight,
                    menuClientRect = menuEl.getBoundingClientRect(),
                    maxWidth = documentWidth - MARGIN * 2,
                    maxHeight = documentHeight - MARGIN * 2;

                var recalculateRect,
                    dontSetLeft, dontSetTop;

                if (menuClientRect.width > maxWidth) {
                    menuEl.style.width = maxWidth + "px";
                    menuEl.style.left = MARGIN + "px";
                    recalculateRect = true;
                    dontSetLeft = true;
                }

                if (menuClientRect.height > maxHeight) {
                    menuEl.style.height = maxHeight + "px";
                    menuEl.style.top = MARGIN + "px";
                    recalculateRect = true;
                    dontSetTop = true;
                }

                if (!dontSetLeft || !dontSetTop) {
                    if (recalculateRect)
                        menuClientRect = menuEl.getBoundingClientRect();

                    if (!dontSetLeft) {
                        var farthestPosition = documentWidth - MARGIN;
                        if (menuClientRect.right > farthestPosition && menuClientRect.width < maxWidth) {
                            var leftDelta = menuClientRect.right - farthestPosition;
                            menuEl.style.left = (buttonRect.left - leftDelta) + "px";
                        }
                    }

                    if (!dontSetTop) {
                        var lowestPosition = documentHeight - MARGIN;
                        if (menuClientRect.bottom > lowestPosition && menuClientRect.height < maxHeight) {
                            var bottomDelta = menuClientRect.bottom - lowestPosition;
                            menuEl.style.top = (buttonRect.top - bottomDelta) + "px";
                        }
                    }
                }

                dropdownEl.classList.add("dropdown-visible");
                addMouseUpTimeout = setTimeout(function(){
                    document.body.addEventListener("mousedown", onMouseDown);
                    menuEl.addEventListener("click", close);
                }, 320);
            }
        }
    }]);
})();