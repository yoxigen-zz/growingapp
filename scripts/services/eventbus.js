"use strict";

angular.module("EventBus", []).factory("eventBus", ["$rootScope", function($rootScope){
    var eventHandlers = {};

    return {
        subscribe: function(eventName, eventHandler){
            var event = eventHandlers[eventName];
            if (!event)
                event = eventHandlers[eventName] = [];

            event.push(eventHandler);
        },
        unsubscribe: function(eventName, eventHandler){
            var event = eventHandlers[eventName];
            if (event){
                for(var i=event.length - 1; i !== 0; i--){
                    if (event[i] === eventHandler)
                        event.splice(i, 1);
                }
            }
        },
        triggerEvent: function(eventName, data){
            var event = eventHandlers[eventName];
            if (event){
                event.forEach(function(eventHandler){
                    eventHandler.call({ eventName: eventName }, data);
                });
            }
        }
    };
}]);