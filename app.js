/*
 ** Dependencies
 */
var angular = require('angular');
var uirouter = require('angular-ui-router');
require('firebase');
require('angularfire');
require('angular-animate');
require('angular-moment');

var FBconfig = {
    apiKey: "AIzaSyD5B_DssWCtBgWn_2-Cy0LhTZGeErAYAJE",
    authDomain: "100meter.firebaseapp.com",
    databaseURL: "https://100meter.firebaseio.com",
    storageBucket: "project-8799195801841300390.appspot.com",
};
firebase.initializeApp(FBconfig);

/*
 ** App
 */
var app = angular.module('app', ['ui.router', 'firebase', 'ngAnimate', 'angularMoment']);

/*
 ** Run & Config
 */
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
require('./src/app/Summary/SummaryController')(app);

/*
 ** Styles
 */
require("./src/styles/home-theme.less");
require("./src/styles/main.css");
require("./src/styles/animations.css");
require("./src/styles/project.less");
require("./src/styles/account.less");
require("./src/styles/lightbox.less");