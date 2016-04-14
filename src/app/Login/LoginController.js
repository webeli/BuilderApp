module.exports = function(app) {
    app.controller('LoginController', function ($scope, FireAuth, $state) {
        var checkAuth = FireAuth.$getAuth();
        if (checkAuth) {
            $state.go("account.myprojects");
        }
        else {
            $scope.validateLoginForm = function (valid, data) {
                console.log(valid);
                console.log(data);
                if (valid) {
                    $scope.loginUser(data);
                }
            };

            $scope.loginUser = function () {
                FireAuth.$authWithPassword({
                    email: $scope.user.email,
                    password: $scope.user.password
                }).then(function (authData) {
                    $state.go("account.myprojects");
                }).catch(function (error) {
                    console.error("Authentication failed:", error);
                });
            }
        }
    });
}