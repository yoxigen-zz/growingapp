define(["app"], function(app) {
    "use strict";

    app.controller("SignUpController", signupController);

    signupController.$inject = ["$scope", "$http", "users", "eventBus"];

    function signupController($scope, $http, users, eventBus) {
        $scope.newUser = {};
        $scope.signUp = signUp;

        $http.get("data/countries.json").then(function(response){
            $scope.countries = response.data;
        });

        function signUp(){
            if (!$scope.newUser.username){
                $scope.signupError = "Please specify your email address";
                $scope.highlight = "username";
                return;
            }

            if (!$scope.newUser.password){
                $scope.signupError = "Please enter password.";
                $scope.highlight = "password";
                return;
            }

            if (!$scope.newUser.confirmPassword){
                $scope.signupError = "Please confirm password.";
                $scope.highlight = "confirm";
                return;
            }

            if ($scope.newUser.confirmPassword !== $scope.newUser.password){
                $scope.signupError = "Passwords don't match.";
                $scope.highlight = "confirm";
                return;
            }

            var newUser = {
                email: $scope.newUser.username,
                username: $scope.newUser.username,
                password: $scope.newUser.password
            };

            if ($scope.newUser.country)
                newUser.country = $scope.newUser.country;

            $scope.loading = true;

            users.signUp(newUser).then(function(user){
                $scope.signupError = null;
            }, function(error){
                console.error("Error creating new user: ", error);
                $scope.signupError = error.message;
            }).finally(function(){
                $scope.loading = false;
            });
        }
    }
});