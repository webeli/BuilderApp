var app = angular.module('builderApp', ['ui.router', 'firebase']);

app.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('landing', {
            url: '/landing/',
            templateUrl: './src/app/Landing/landing.html'
        })
        .state('main', {
            url: '/main/',
            templateUrl: './src/app/Main/main.html'
        })
        .state('account', {
            url: '/account/',
            templateUrl: './src/app/Account/account.html'
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