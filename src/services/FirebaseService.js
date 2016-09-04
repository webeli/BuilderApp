module.exports = function(app) {

    // factory that generates the $firebase reference
    app.factory('FireRef', ['$firebase', function($firebase) {
        return firebase.database().ref();
    }]);

}