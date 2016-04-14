module.exports = function(app) {
    app.controller('AccountController', function ($scope, $firebaseArray, FireRef, FireAuth, $state) {

        var checkAuth = FireAuth.$getAuth();
        $scope.authData = checkAuth;
        console.log(checkAuth);

        var myProjects = $firebaseArray(FireRef);
        $scope.myProjects = myProjects;

        $scope.logout = function () {
            console.log("Logout");
            FireAuth.$unauth();
            $state.go("login");
        };

        $scope.deleteProject = function (pId) {
            var projectId = FireRef.child(pId);
            projectId.remove();
        };

        $scope.createProject = function (pN) {
            if (!pN) {
                return;
            }
            FireRef.push({pName: pN}, onComplete);
        };

        function onComplete() {
            $scope.projectCreated = "Created project: " + $scope.projectName;
            $scope.projectName = "";
            $scope.$apply();
        }
    });
}