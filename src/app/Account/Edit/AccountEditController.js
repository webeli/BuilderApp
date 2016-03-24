app.controller('AccountEditController', function($scope, FireRef, $stateParams, $firebaseArray, $uibModal) {
    console.log("AccountEditController");

    var projectKey = $stateParams.projectKey;
    var projectCategoryArray = $firebaseArray(FireRef.child(projectKey).child("categories"));
    var projectCategoryRef = FireRef.child(projectKey).child("categories");

    $scope.addCategory = function () {
        var data = prompt("Ange något");
        projectCategoryRef.push({
            title: data
        });
    };

    $scope.addItem = function (id) {
        var data = prompt("Ange något");
        projectCategoryRef.child(id).child("items").push({
            title: data
        });
    };

    $scope.oneAtATime = true;

    $scope.categories = projectCategoryArray;

});