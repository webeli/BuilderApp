module.exports = function(app) {
    app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home', {
                url: '/home/',
                template: require('./Home/home.html'),
                controller: 'HomeController'
            })
            .state('project', {
                url: '/project/:projectKey',
                template: require('./Project/project.html'),
                controller: 'ProjectController'
            })
            .state('demo', {
                url: '/demo',
                template: require('./Project/project.html'),
                controller: 'ProjectController'
            });

        $urlRouterProvider.otherwise('/home/');
    }]);
};