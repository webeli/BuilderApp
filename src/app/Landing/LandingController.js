module.exports = function(app) {
    app.controller('LandingController', ['$scope', 'FireRef', '$state', function($scope, FireRef, $state) {

        $scope.goToProject = function (pId) {
            if (!pId) {
                return;
            }

            var projectRef = FireRef.child(pId);
            projectRef.once("value", function (snapshot) {
                var a = snapshot.exists();
                if (a === true) {
                    $state.go("project", {"projectKey": pId});
                } else {
                    console.log("You entered an undefined projectId");
                }
            });

        }

    }]);
}