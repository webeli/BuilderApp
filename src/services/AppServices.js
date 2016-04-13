app.factory("GetChildElementsByKey", ["$timeout", function($timeout) {
    var ref = new Firebase("https://100meter.firebaseio.com/");
    return ref;
}]);

app.factory('formatPrice', function() {
    return {
        foo: function() {
            alert("I'm foo!");
        }
    };
});

// READ UP ON
//http://stackoverflow.com/questions/21776237/angularjs-pass-variables-in-service
//https://www.firebase.com/docs/web/libraries/angular/guide/extending-services.html
//https://www.firebase.com/docs/web/libraries/angular/api.html#angularfire-extending-the-services
