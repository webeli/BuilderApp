app.controller('AccountEditController', function($scope, FireRef, $stateParams, $firebaseArray, $uibModal) {
    console.log("AccountEditController");

    var projectKey = $stateParams.projectKey;

    // Base ref for project
    var FireProjectRef = FireRef.child(projectKey);

    // Push
    var projectCategoryRef = FireProjectRef.child("categories");
    var projectCategoryItemsRef = FireProjectRef.child("categoryItems");
    var projectItemOptionsRef = FireProjectRef.child("itemOptions");

    // Get
    var projectCategoryArray = $firebaseArray(FireProjectRef.child("categories"));
    var projectCategoryItemsArray = $firebaseArray(FireProjectRef.child("categoryItems"));
    var projectItemOptionsArray = $firebaseArray(FireProjectRef.child("itemOptions"));

    console.log("#1 ", $firebaseArray);

    $scope.addCategory = function () {
        var data = prompt("Ange något");
        projectCategoryRef.push({
            title: data
        });
    };

    $scope.addItem = function (id) {
        var data = prompt("Ange något");

        var newMessageRef = projectCategoryItemsRef.push();
        var key = newMessageRef.key();

        console.log(key);

        newMessageRef.set({
            title: data
        });

        projectCategoryRef.child(id).child("refs").child(key).set(true);

    };

    $scope.getItems = function(id) {


        var refArray = $firebaseArray(FireProjectRef.child("categories").child(id).child("refs"));

        console.log(refArray);

        $scope.categoryItems = refArray;
    };

    /*$scope.getItem = function (id) {
        var result = $firebaseArray(FireRef.child(projectKey).child("categories").child(id).child("items"));
        $scope.categoryItems = result;

    };*/

    $scope.oneAtATime = true;

    $scope.categories = projectCategoryArray;


});