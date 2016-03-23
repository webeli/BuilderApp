app.controller('ProjectController', function($scope, FireRef, $stateParams, $state, $firebaseObject) {
    console.log("ProjectController");

    var projectRef = FireRef.child($stateParams.projectKey);

    projectRef.once("value", function(snapshot) {
        var projectKey = snapshot.exists();
        if (projectKey === false) {
            $state.go("landing");
        } else {
            $scope.projectTitle = snapshot.val().pName;
            $scope.$apply(); //TODO: is this efficient? find another way
        }
    });

    var values = $firebaseObject(FireRef.child($stateParams.projectKey).child("categories"));
    console.log(values);
    $scope.values = values;

});