app.controller('AccountEditController', function($scope, FireRef, $stateParams, $firebaseArray, $uibModal, $timeout) {
    console.log("AccountEditController");

    var projectKey = $stateParams.projectKey;

    // Base ref for project
    var FireProjectRef = FireRef.child(projectKey);

    // Firebase references
    // ex: var valueRef = new Firebase("https://100meter.firebaseio.com/").child("value");
    var projectCategoryRef = FireProjectRef.child("categories");
    var projectCategoryItemsRef = FireProjectRef.child("categoryItems");
    var projectItemOptionsRef = FireProjectRef.child("itemOptions");

    // Get as array
    var projectCategoryArray = $firebaseArray(FireProjectRef.child("categories"));
    var projectCategoryItemsArray = $firebaseArray(FireProjectRef.child("categoryItems"));
    var projectItemOptionsArray = $firebaseArray(FireProjectRef.child("itemOptions"));

    // Starting $scope variables
    $scope.oneAtATime = true;
    $scope.categories = projectCategoryArray;

    // Add category
    $scope.addCategory = function () {
        var data = prompt("Ange något");
        projectCategoryRef.push({
            title: data
        });
    };

    // Add category item
    $scope.addItem = function (id) {
        var data = prompt("Ange något");
        var categoryItemsRef = projectCategoryItemsRef.push();
        var categoryItemsKey = categoryItemsRef.key();

        // Add reference key to category and data to categoryItems node
        categoryItemsRef.set({title: data, key: categoryItemsKey});
        projectCategoryRef.child(id).child("refs").child(categoryItemsKey).set(true);

    };

    // Get category items
    $scope.getItems = function(key) {
        // Store data as object and use in scope
        $scope.categoryItems = {};

        // Get all category item keys
        var categoryKeyRefs = FireProjectRef.child("categories").child(key).child("refs");

        // Iterate through all keys from "categoryKeyRefs" and get data from "projectCategoryItemsRef"
        categoryKeyRefs.on('child_added', function(snapshot) {
            var itemKey = snapshot.key();
            projectCategoryItemsRef.child(itemKey).on('value', function(snapshot) {
                $timeout(function() {
                    if( snapshot.val() === null ) {
                        delete $scope.categoryItems[itemKey];
                    }
                    else {
                        $scope.categoryItems[itemKey] = snapshot.val();
                    }
                });
            });
        });
    };

    $scope.enterCategoryItem = function(key) {
        console.log(key);
    };

});