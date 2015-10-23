define(["angular", "services/config", "classes/eventbus_class", "services/users"], function(angular){
    return angular.module("Dialogs", ["Config", "EventBus", "Users"]);
});
