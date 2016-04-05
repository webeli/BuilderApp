var app = angular.module('builderApp', ['ui.router', 'firebase', 'ngAnimate']);

app.run(["$rootScope", "$state", function($rootScope, $location) {
    $rootScope.$on("$routeChangeError", function(event, next, previous, error) {
        // We can catch the error thrown when the $requireAuth promise is rejected
        // and redirect the user back to the login page
        if (error === "AUTH_REQUIRED") {
            $state.go("login");
        }
    });
}]);

app.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('landing', {
            url: '/landing/',
            templateUrl: './src/app/Landing/landing.html',
            controller: 'LandingController'
        })
        .state('project', {
            url: '/project/:projectKey',
            templateUrl: './src/app/Project/project.html',
            controller: 'ProjectController'
        })
        .state('login', {
            url: '/login/',
            templateUrl: './src/app/Login/login.html',
            controller: 'LoginController'
        })
        .state('account', {
            url: '/account/',
            templateUrl: './src/app/Account/account.html',
            controller: 'AccountController',
            resolve: {
                "currentAuth": ["FireAuth", function(FireAuth) {
                    // $requireAuth returns a promise so the resolve waits for it to complete
                    // If the promise is rejected, it will throw a $stateChangeError (see above)
                    return FireAuth.$requireAuth();
                }]
            }
        })
            .state('account.myprojects', {
                url: 'my-projects/',
                templateUrl: './src/app/Account/MyProject/myprojects.html',
                controller: 'AccountController'
            })
            .state('account.createproject', {
                url: 'create-project/',
                templateUrl: './src/app/Account/CreateProject/createproject.html',
                controller: 'AccountController'
            })
            .state('account.editproject', {
                url: 'edit-project/:projectKey',
                templateUrl: './src/app/Account/Edit/editproject.html',
                controller: 'AccountEditController'
            });

    $urlRouterProvider.otherwise('/landing/');
});