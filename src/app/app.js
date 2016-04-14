/*
 ** Dependencies
 */
var $ = require('jquery');
window.jQuery = $;
window.$ = $;
var bootstrap = require('bootstrap');
var angular = require('angular');
var uirouter = require('angular-ui-router');
var Firebase = require('firebase');
var angularfire = require('angularfire');
var angularanimate = require('angular-animate');

/*
 ** App
 */
var app = angular.module('app', ['ui.router', 'firebase', 'ngAnimate']);

/*
 ** Run & Config
 */
require('./app.run')(app);
require('./app.config')(app);

/*
 ** Services
 */
require('../services/FirebaseService')(app);
require('../services/AppFilters')(app);
require('../services/AppDirectives')(app);
require('../services/AppServices')(app);

/*
 ** Controllers
 */
require('./Landing/LandingController')(app);
require('./Project/ProjectController')(app);
require('./Account/AccountController')(app);
require('./Account/Edit/AccountEditController')(app);
require('./Login/LoginController')(app);
require('./Summary/SummaryController')(app);

/*
 ** Styles
 */

