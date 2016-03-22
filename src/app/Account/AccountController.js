app.controller('AccountController', function($scope, $firebaseArray, FireRef) {
    console.log("AccountController");

    $scope.projectName = "";
    $scope.myProjects = "Loding projects...";

    var myProjects = $firebaseArray(FireRef);
    $scope.myProjects = myProjects;

    $scope.deleteProject = function(pId) {
        console.log(pId);
        var projectId = FireRef.child(pId);
        projectId.remove();
    }

    $scope.createProject = function(pN) {
        if (!pN) { return; }

        $scope.projectName = "";
        FireRef.push({ pName: pN }, onComplete);
    }

    function onComplete(){
        console.log("completed");
    }
});