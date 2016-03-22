app.controller('MainController', function($scope, FireRef, $stateParams) {
    $scope.pId = $stateParams.projectId;
    console.log($stateParams.projectId);
    console.log("MainController");

    var projectRef = FireRef.child($stateParams.projectId);
    projectRef.once("value", function(snapshot) {
        var a = snapshot.exists();
        console.log(a);
    });

});