app.controller('ProjectController', function($scope, FireRef, $stateParams, $state, $firebaseArray, $timeout) {
    console.log("ProjectController");

    // KEY
    var projectKey = $stateParams.projectKey;
    // Base ref for project
    var FireProjectRef = FireRef.child(projectKey);


    FireProjectRef.once("value", function(snapshot) {
        var projectKey = snapshot.exists();
        if (projectKey === false) {
            $state.go("landing");
        } else {
            $scope.projectTitle = snapshot.val().pName;
            $scope.$apply(); //TODO: is this efficient? find another way
        }
    });




    $scope.completeArray = {Categories: []};


    FireProjectRef.child("categories").once("value", function(snapshot) {
        // The callback function will get called twice, once for "fred" and once for "barney"

        snapshot.forEach(function(childSnapshot) {

            // key will be "fred" the first time and "barney" the second time
            var key = childSnapshot.key();
            // childData will be the actual contents of the child
            var childData = childSnapshot.val();


            var tempArray = [];

            FireProjectRef.child("categories").child(key).child("refs").once("value", function(snapshot) {

                snapshot.forEach(function(childSnapshot) {
                    var key = childSnapshot.key();

                    var test = FireRef.child($stateParams.projectKey).child("categoryItems").child(key);

                    test.once("value", function(snap) {
                        tempArray.push(snap.val());
                    });


                    //var key = snapshot.val();
                    //console.log(key);

                });
            });

            $scope.completeArray.Categories.push({Category: childData, Items: tempArray});


        });
    });

    // Get the options for an item
    $scope.getOptions = function(key, categoryName, itemName) {
        // Store data as object and use in scope
        $scope.imgCategory = categoryName;
        $scope.imgItem = itemName;
        $scope.itemOptions = {};

        // Get all category item keys
        var categoryItemKeyRefs = FireProjectRef.child("categoryItems").child(key).child("refs");

        // Iterate through all keys from "categoryKeyRefs" and get data from "projectCategoryItemsRef"
        categoryItemKeyRefs.on('child_added', function(snapshot) {
            var itemKey = snapshot.key();
            FireProjectRef.child("itemOptions").child(itemKey).on('value', function(snapshot) {
                $timeout(function() {
                    if( snapshot.val() === null ) {
                        delete $scope.itemOptions[itemKey];
                    }
                    else {
                        $scope.itemOptions[itemKey] = snapshot.val();
                    }
                });
            });
        });
    };
});

//Show only active ones
app.filter('onlyActive', function () {
    return function (items) {
        var result = [];
        angular.forEach(items, function (value, key) {

            if (value.active === true) {
                result.push(value);
            }

        });
        return result;

    }
});