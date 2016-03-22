var app = angular.module('builderApp', ['ui.router', 'firebase']);

app.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('landing', {
            url: '/landing/',
            templateUrl: './src/app/Landing/landing.html',
            controller: 'LandingController'
        })
        .state('project', {
            url: '/project/:projectKey',
            templateUrl: './src/app/Main/main.html',
            controller: 'MainController'
        })
        .state('account', {
            url: '/account/',
            templateUrl: './src/app/Account/account.html',
            controller: 'AccountController'
        })
            .state('account.myprojects', {
                url: 'my-projects/',
                templateUrl: './src/app/Account/myprojects.html'
            })
            .state('account.createproject', {
                url: 'create-project/',
                templateUrl: './src/app/Account/createproject.html'
            });

    $urlRouterProvider.otherwise('/landing/');
});