app.controller('LoginController', function($scope, FireAuth, $state) {
    var checkAuth = FireAuth.$getAuth();
    if (checkAuth) {
        $state.go("account.myprojects");
    }
    else {
        $scope.loginUser = function() {
            FireAuth.$authWithPassword({
                email: $scope.user.email,
                password: $scope.user.password
            }).then(function(authData) {
                $state.go("account.myprojects");
            }).catch(function(error) {
                console.error("Authentication failed:", error);
            });
        }
    }
});