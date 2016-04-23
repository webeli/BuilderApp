/*
 ** Dependencies
 */
var angular = require('angular');
var uirouter = require('angular-ui-router');
var Firebase = require('firebase');
var angularfire = require('angularfire');
var angularanimate = require('angular-animate');
require('moment');
require('angular-moment');

/*
 ** App
 */
var app = angular.module('app', ['ui.router', 'firebase', 'ngAnimate']);

/*
 ** Run & Config
 */
require('./src/app/app.run.js')(app);
require('./src/app/app.config.js')(app);

/*
 ** Services
 */
require('./src/services/FirebaseService')(app);
require('./src/services/AppFilters')(app);
require('./src/services/AppDirectives')(app);
require('./src/services/AppServices')(app);

/*
 ** Controllers
 */
require('./src/app/Home/HomeController')(app);
require('./src/app/Project/ProjectController')(app);
require('./src/app/Account/AccountController')(app);
require('./src/app/Account/Edit/AccountEditController')(app);
require('./src/app/Login/LoginController')(app);
require('./src/app/Summary/SummaryController')(app);

/*
 ** Styles
 */
require("./src/styles/main.css");
require("./src/styles/animations.css");
require("./src/styles/home.css");
require("./src/styles/project.less");
require("./src/styles/account.less");
require("./src/styles/lightbox.less");

