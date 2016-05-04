module.exports = function(app) {
    app.controller('AccountController', ['$scope', '$firebaseArray', 'FireRef', 'FireAuth', '$state', function($scope, $firebaseArray, FireRef, FireAuth, $state) {

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

        $scope.createProject = function (project) {

            if (!project) {
                return;
            }

            var deadline = new Date(project.deadline);

            FireRef.push({
                pName: project.projectName,
                deadline: deadline
            }, onComplete);
        };

        function onComplete() {
            $scope.projectCreated = "Created project: " + $scope.project.projectName;
            //$scope.project.projectName = "";
            //$scope.project.deadline = "";
            $scope.$apply();
        }
    }]);
}