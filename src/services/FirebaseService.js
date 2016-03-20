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