module.exports = function(app) {
    app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('landing', {
                url: '/landing/',
                template: require('./Landing/landing.html'),
                controller: 'LandingController'
            })
            .state('project', {
                url: '/project/:projectKey',
                template: require('./Project/project.html'),
                controller: 'ProjectController'
            })
            .state('summary', {
                url: '/summary/:projectKey',
                template: require('./Summary/summary.html'),
                controller: 'SummaryController'
            })
            .state('login', {
                url: '/login/',
                template: require('./Login/login.html'),
                controller: 'LoginController'
            })
            .state('account', {
                url: '/account/',
                template: require('./Account/account.html'),
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
                template: require('./Account/MyProject/myprojects.html'),
                controller: 'AccountController'
            })
            .state('account.createproject', {
                url: 'create-project/',
                template: require('./Account/CreateProject/createproject.html'),
                controller: 'AccountController'
            })
            .state('account.editproject', {
                url: 'edit-project/:projectKey',
                template: require('./Account/Edit/editproject.html'),
                controller: 'AccountEditController'
            });

        $urlRouterProvider.otherwise('/landing/');
    }]);
}