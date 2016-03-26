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


    $scope.pick = function (itemOption, cat) {
        itemOption.chosen = true;
        cat.selectedOption = itemOption;
    };

    $scope.getTotal = function(){
        var total = 0;
        for(var i = 0; i < $scope.completeArray.Categories.length; i++){
            for(var j = 0; j < $scope.completeArray.Categories[i].Items.length; j++){

                var item = $scope.completeArray.Categories[i].Items[j];
                if (item.selectedOption)
                {
                    total += item.selectedOption.price;
                }
            }
        }
        return total;
    };

    $scope.completeArray = {Categories: []};

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

            $scope.completeArray.Categories.push({Category: childData, Items: tempArray});


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

app.directive('checkImage', function($http) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            attrs.$observe('ngSrc', function(ngSrc) {

                $http.get(ngSrc).success(function(){
                    console.log('image exist');
                }).error(function(){
                    console.log('image does not exist');
                    //element.attr('src', 'http://upload.wikimedia.org/wikipedia/commons/7/73/Lion_waiting_in_Namibia.jpg'); // set default image
                });
            });
        }
    };
});