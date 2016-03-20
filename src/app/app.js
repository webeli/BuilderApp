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
        });

    $urlRouterProvider.otherwise('/landing/');
});