app.controller('MainController', function($scope, FireRef, $stateParams, $state) {
    console.log("MainController");

    var projectRef = FireRef.child($stateParams.projectKey);
    projectRef.once("value", function(snapshot) {
        var projectKey = snapshot.exists();
        if (projectKey === false) {
            $state.go("landing");
        } else {
            console.log(projectKey);
        }
    });

});