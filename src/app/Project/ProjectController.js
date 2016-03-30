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
        }
    });

    $scope.pick = function (itemOption, cat) {
        itemOption.chosen = true;
        cat.selectedOption = itemOption;
    };

    $scope.getTotal = function(){
        var total = 0;
        for(var i = 0; i < $scope.AllCategories.length; i++){
            for(var j = 0; j < $scope.AllCategories[i].Items.length; j++){

                var item = $scope.AllCategories[i].Items[j];
                if (item.selectedOption)
                {
                    total += item.selectedOption.price;
                }
            }
        }
        return total;
    };

    // TODO:
    // Need to solve this in a diffrent way (creating an issue when reloading the page).
    $scope.AllCategories = [];

    FireProjectRef.child("categories").once("value", function(snapshot) {

        snapshot.forEach(function(childSnapshot) {

            var key = childSnapshot.key();
            var childData = childSnapshot.val();
            var tempArray = [];

            FireProjectRef.child("categories").child(key).child("refs").once("value", function(snapshot) {

                snapshot.forEach(function(childSnapshot) {

                    var key = childSnapshot.key();
                    var categoryItemRef = FireRef.child($stateParams.projectKey).child("categoryItems").child(key);

                    categoryItemRef.once("value", function(snap) {
                        tempArray.push(snap.val());
                    });

                });
            });

            $scope.AllCategories.push({Category: childData, Items: tempArray});


        });
    });

    // Get the options for an item
    $scope.getOptions = function(categoryName, item) {
        // Store data as object and use in scope
        $scope.currentCat = item;
        $scope.imgCategory = categoryName;
        $scope.imgItem = item.title;
        $scope.itemOptions = {};

        // Get all category item keys
        var categoryItemKeyRefs = FireProjectRef.child("categoryItems").child(item.key).child("refs");

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