app.controller('AccountController', function($scope, $firebaseArray, FireRef) {
    console.log("AccountController");

    var myProjects = $firebaseArray(FireRef);
    $scope.myProjects = myProjects;

    $scope.deleteProject = function(pId) {
        var projectId = FireRef.child(pId);
        projectId.remove();
    };

    $scope.createProject = function(pN) {
        if (!pN) { return; }
        FireRef.push({ pName: pN }, onComplete);
    };

    function onComplete(){
        $scope.projectCreated = "Created project: " + $scope.projectName;
        $scope.projectName = "";
        $scope.$apply();
    }
});