app.controller("SignUpController", ["$scope", "$http", "users", "eventBus", function($scope, $http, users, eventBus){
    $scope.newUser = {};

    $http.get("data/countries.json").then(function(response){
        $scope.countries = response.data;
    });

    $scope.signUp = function(){
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

        users.signUp(newUser).then(function(user){
            eventBus.triggerEvent("login", { user: user, isNewUser: true });
            $scope.signupError = null;
        }, function(error){
            console.error("Error creating new user: ", error);
            $scope.loginError = error.message;
        });
    }
}]);
