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

            var deadline = formatDate(project.deadline);

            FireRef.push({
                pName: project.projectName,
                deadline: deadline
            }, onComplete);
        };

        $scope.deadlineCountdown = function(date) {
            var releaseDate = moment("2012-09-25");
            console.log(releaseDate);
            console.log(date);
        };

        function formatDate(date) {
            var d = new Date(date),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();

            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;

            return [year, month, day].join('-');
        }

        function onComplete() {
            $scope.projectCreated = "Created project: " + $scope.project.projectName;
            //$scope.project.projectName = "";
            //$scope.project.deadline = "";
            $scope.$apply();
        }
    }]);
}