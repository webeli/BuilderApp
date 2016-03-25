var app = angular.module('builderApp', ['ui.router', 'firebase', 'ui.bootstrap', 'ngAnimate']);

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
        .state('account', {
            url: '/account/',
            templateUrl: './src/app/Account/account.html',
            controller: 'AccountController'
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