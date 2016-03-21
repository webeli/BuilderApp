app.controller('AccountController', function($scope, FireRef) {
    console.log("AccountController");

    $scope.projectName = "";

    $scope.createProject = function(pN){
        if (!pN) { return; }

        FireRef.push({ projectname: pN }, onComplete);
        $scope.projectName = "";
    }

    function onComplete(){
        console.log("completed");
    }
});