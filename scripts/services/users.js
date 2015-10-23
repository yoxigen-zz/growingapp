define(["angular", "services/storage", "classes/eventbus_class"], function(angular){
    angular.module("Users", ["Storage", "EventBus"]).factory("users", users);

    users.$inject = ["$q", "parse", "Storage", "EventBus"];

    function users($q, parse, Storage, EventBus){
        var usersStorage = new Storage("users"),
            emailRegExp = /^(([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+)?$/,
            usersEventBus;

        var methods = {
            facebookLogin: function(){
                return parse.facebookLogin();
            },
            getCurrentUser: function(){
                return parse.getCurrentUser();
            },
            getLastUser: function(){
                return usersStorage.local.getItem("lastLogin");
            },
            login: function(username, password){
                var deferred = $q.defer();

                parse.login(username, password).then(function(user){
                    usersStorage.local.setItem("lastLogin", user.attributes.username);
                    methods.currentUser = user;
                    usersEventBus.triggerEvent("login", { user: user });
                    deferred.resolve(user);
                }, deferred.reject);

                return deferred.promise;
            },
            logout: function(){
                parse.logout();
                usersEventBus.triggerEvent("logout", methods.currentUser);
                methods.currentUser = null;
            },
            signUp: function(userDetails){
                return parse.signUp(userDetails).then(function(user){
                    methods.currentUser = user;
                    usersEventBus.triggerEvent("login", { user: user, isNewUser: true });
                    return user;
                });
            },
            validateUsername: function(username){
                return emailRegExp.test(username);
            }
        };

        usersEventBus = EventBus.setToObject(methods, ["login", "logout"]);
        if (methods.currentUser = methods.getCurrentUser())
            usersEventBus.triggerEvent("login", { user: methods.currentUser });

        return methods;
    }
});