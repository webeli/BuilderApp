module.exports = function(app) {
    app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home', {
                url: '/home/',
                template: require('./Home/home.html'),
                controller: 'HomeController'
            })
            .state('start', {
                url: '/start/',
                template: require('./Start/start.html'),
                controller: 'StartController'
            })
            .state('project', {
                url: '/project/:projectKey',
                template: require('./Project/project.html'),
                controller: 'ProjectController'
            });

        $urlRouterProvider.otherwise('/home/');
    }]);
};