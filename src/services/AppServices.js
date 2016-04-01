app.factory("GetChildElementsByKey", ["$timeout", function($timeout) {
    var ref = new Firebase("https://100meter.firebaseio.com/");
    return ref;
}]);

// READ UP ON
//http://stackoverflow.com/questions/21776237/angularjs-pass-variables-in-service
//https://www.firebase.com/docs/web/libraries/angular/guide/extending-services.html
//https://www.firebase.com/docs/web/libraries/angular/api.html#angularfire-extending-the-services
