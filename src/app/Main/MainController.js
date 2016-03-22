app.controller('MainController', function($scope, FireRef, $stateParams, $state) {
    console.log("MainController");

    var projectRef = FireRef.child($stateParams.projectId);
    projectRef.once("value", function(snapshot) {
        var a = snapshot.exists();
        if (a === false) {
            $state.go("landing");
        } else {
            console.log(a);
        }
    });

});