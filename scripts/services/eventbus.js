define(["classes/eventbus_class"], function(){
    "use strict";

    return angular.module("EventBus").factory("eventBus", ["EventBus", function(EventBus){
        return new EventBus();
    }]);
});