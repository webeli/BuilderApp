app.controller('SummaryController', function($scope, $state, $stateParams, FireRef, $firebaseArray) {

    var projectKey = $stateParams.projectKey;
    var projectRef = FireRef.child(projectKey);

    // Init
    projectRef.onAuth(authDataCallback);

    function authDataCallback(authData) {
        if (authData) {
            var cartRef = projectRef.child("sessionCarts").child(authData.uid).child("cart");
            $scope.cart = $firebaseArray(cartRef);
        }
    }

});