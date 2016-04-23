module.exports = function(app) {
    app.run(['$rootScope', '$state', function($rootScope, $location) {
        $rootScope.$on("$routeChangeError", function(event, next, previous, error) {
            // We can catch the error thrown when the $requireAuth promise is rejected
            // and redirect the user back to the login page
            if (error === "AUTH_REQUIRED") {
                $state.go("login");
            }
        });
    }]);
}