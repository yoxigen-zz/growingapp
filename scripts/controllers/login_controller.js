app.controller("LoginController", ["$scope", "users", "eventBus", function($scope, users, eventBus){
    $scope.confirmPassword = "";
    $scope.loginUser = {};

    users.getLastUser().then(function(username){
        $scope.loginUser.username = username;
    });

    $scope.$on("modalClose", function(){
        $scope.closeViewer();
    });

    $scope.$watch("showLogin", function(value){
        if (!value)
            $scope.loginUser.password = null;
    });

    $scope.signIn = function(){
        if (!$scope.loginUser || !$scope.loginUser.username || !$scope.loginUser.password){
            $scope.loginError = "Please enter email adress and password.";
            return;
        }

        if (!users.validateUsername($scope.loginUser.username)){
            $scope.loginError = "Invalid email address.";
            return;
        }

        if ($scope.newUser){
            if (!$scope.loginUser.confirmPassword){
                $scope.loginError = "Please confirm password.";
                return;
            }

            if ($scope.loginUser.confirmPassword !== $scope.loginUser.password){
                $scope.loginError = "Passwords don't match.";
                return;
            }

            $scope.loginUser.email = $scope.loginUser.username;
            var newUser = {
                email: $scope.loginUser.username,
                username: $scope.loginUser.username,
                password: $scope.loginUser.password
            };

            users.signUp(newUser).then(function(user){
                onLogin(user);
            }, function(error){
                $scope.loginError = error.message;
                alert("Can't sign up: " + error.message);
            });
        }
        else{
            users.login($scope.loginUser.username, $scope.loginUser.password).then(function(user){
                onLogin(user);
            }, function(error){
                $scope.loginError = error.message;
                alert("Can't login: " + error.message);
            });
        }

    };

    $scope.facebookLogin = function(){
        users.facebookLogin().then(function(user){
            onLogin(user);
        }, function(error){
            alert("Can't login: " + error.message);
            $scope.loginError = error.message;
        });
    };

    function onLogin(user){
        eventBus.triggerEvent("login", { user: user });
    }

}]);