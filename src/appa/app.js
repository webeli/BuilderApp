var app = angular.module('builderApp', ['ui.router', 'firebase']);


// factory that generates the $firebaseAuth instance
app.factory("FireAuth", ["$firebaseAuth", function($firebaseAuth) {
    var ref = new Firebase("https://flower.firebaseio.com/");
    return $firebaseAuth(ref);
}]);

// factory that generates the $firebase reference
app.factory("FireRef", ["$firebase", function($firebase) {
    var ref = new Firebase("https://flower.firebaseio.com/");
    return ref;
}]);

app.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('landing/', {
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