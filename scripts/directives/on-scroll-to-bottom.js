define(["angular"], function(angular){
    return angular.module("OnScrollToBottom", []).directive("onScrollToBottom", function(){
        return {
            restrict: "A",
            scope: {
                onScrollToBottom: "&",
                doneScrolling: "="
            },
            link: function(scope, element){
                var el = element[0];
                var listenerOn = true;

                if (!scope.doneScrolling)
                    addListener();

                scope.$watch("doneScrolling", function(value){
                    if (value === listenerOn){
                        if (value)
                            removeListener();
                        else
                            addListener();
                    }
                });

                function addListener(){
                    el.addEventListener("scroll", onScroll);
                    listenerOn = true;
                }

                function removeListener(){
                    el.removeEventListener("scroll", onScroll);
                    listenerOn = false;
                }

                function onScroll(e){
                    if (isBottom()) {
                        scope.onScrollToBottom();
                    }
                }

                function isBottom(){
                    return el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
                }
            }
        }
    });
});