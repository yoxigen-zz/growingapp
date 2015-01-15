"use strict";

angular.module("EventBus").factory("eventBus", ["EventBus", function(EventBus){
    return new EventBus();
}]);