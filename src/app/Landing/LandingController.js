app.controller('LandingController', function($scope, FireRef, $state) {
    console.log("LandingController");

    $scope.goToProject = function(pId){
        if (!pId) {
            return;
        }

        var projectRef = FireRef.child(pId);
        projectRef.once("value", function(snapshot) {
            var a = snapshot.exists();
            if (a === true) {
                $state.go("main", { "projectKey": pId});
            } else {
                console.log("You entered an undefined projectId");
            }
        });

    }

});