module.exports = function(app) {
    app.controller('HomeController', ['$scope', 'FireRef', '$state', function($scope, FireRef, $state) {

        $scope.demoBtn = "Få mer information";
        $scope.inputDisabled = false;

        $scope.currentTab = 'tab1';

        $scope.cartvid = false;
        $scope.flowvid = false;
        $scope.finalvid = false;

        $scope.requestDemo = function(data) {
            if (data) {
                var demoRef = FireRef.child("demoRequest");
                demoRef.push(data);
                $scope.demoBtn = "Tack, vi hör av oss inom kort!"
                $scope.inputDisabled = true;
            }
        };

        /*$scope.goToProject = function (pId) {
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
        }*/

    }]);
}