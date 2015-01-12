"use strict";

angular.module("GrowingApp").factory("eventBus", ["EventBus", function(EventBus){
    return new EventBus();
}]);