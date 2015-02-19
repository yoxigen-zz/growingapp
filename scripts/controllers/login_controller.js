define(["app"], function(app){
    "use strict";

    app.controller("LoginController", loginController);

    loginController.$inject = ["$scope", "users", "eventBus", "messages"];

    function loginController($scope, users, eventBus, messages){
        $scope.confirmPassword = "";
        $scope.loginUser = {};
        $scope.signIn = signIn;
        $scope.facebookLogin = facebookLogin;

        users.getLastUser().then(function(username){
            $scope.loginUser.username = username;
        });

        eventBus.subscribe("doLogin", signIn);

        function signIn(){
            if (!$scope.loginUser || !$scope.loginUser.username || !$scope.loginUser.password){
                $scope.loginError = "Please enter email adress and password.";
                return;
            }

            if (!users.validateUsername($scope.loginUser.username)){
                $scope.loginError = "Invalid email address.";
                return;
            }

            $scope.loading = true;

            users.login($scope.loginUser.username, $scope.loginUser.password).catch(function(error){
                $scope.loginError = error.message;
                alert(error.message);
                messages.error("Can't login: " + error.message);
            }).finally(function(){
                $scope.loading = false;
            });
        }

        function facebookLogin(){
            users.facebookLogin().catch(function(error){
                messages.error("Can't login: " + error.message);
                $scope.loginError = error.message;
            });
        }
    }
});