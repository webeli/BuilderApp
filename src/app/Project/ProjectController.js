app.controller('ProjectController', function($scope, FireRef, $stateParams, $state, $firebaseArray, $firebaseObject, $timeout) {

    /*
    ** Refs
    */
    var projectKey = $stateParams.projectKey;
    var projectRef = FireRef.child(projectKey);

    /*
    ** Scope variables
    */
    $scope.allCategories = [];
    $scope.currentCategory = null;
    $scope.imgCategory = null;
    $scope.imgItem = null;
    $scope.itemOptions = [];
    $scope.projectTitle = null;

    /*
    ** Init
    */
    validateProjectKey();
    getAllCategories();

    /*
    ** Private functions
    */
    function validateProjectKey() {
        projectRef.once("value", function(snapshot) {
            var projectKey = snapshot.exists();
            if (projectKey === false) {
                $state.go("landing");
            } else {
                $scope.projectTitle = snapshot.val().pName;
            }
        });
    }

    function getAllCategories() {
        var categoriesRef = projectRef.child("categories");
        var categoriesFirebaseArray = $firebaseArray(categoriesRef);

        categoriesFirebaseArray.$loaded().then(function(categories){
            var allCats = [];

            angular.forEach(categories, function(category) {
                var categoryWithItems = getCategoryItem(category);
                allCats.push(categoryWithItems);
            });
            $scope.allCategories = allCats;
        });

        return true;
    }

    function getCategoryItem(category) {
        category['categoryItems'] = [];

        angular.forEach(category.refs, function(key) {

            var categoryItemsRef = projectRef.child("categoryItems");
            var categoryItemRef = categoryItemsRef.child(key);

            categoryItemRef.on('value', function(snap) {
                $timeout(function() {
                    category.categoryItems.push(snap.val());
                });
            });

        }, category.categoryItems); //forEach

        return category;
    }

    /*
    ** Scope functions
    */
    $scope.selectOption = function (itemOption, cat, value) {
        itemOption.chosen = value;
        value === true ? cat.selectedOption = itemOption : cat.selectedOption = null;
    };


    $scope.getTotal = function(){
        var total = 0;
        angular.forEach($scope.allCategories, function(key, i){
            for(var j = 0; j < $scope.allCategories[i].categoryItems.length; j++){

                var item = $scope.allCategories[i].categoryItems[j];
                if (item.selectedOption)
                {
                    total += item.selectedOption.price;
                }
            }
        });
        return total;
    };

    $scope.getItemOptions = function(key) {
        console.log(key);
        var itemOption = projectRef.child("itemOptions").child(key);
        console.log(itemOption);

        itemOption.on('value', function(snap) {
            $timeout(function() {
                $scope.list = snap.val();
            });
        });
    };

    // Get the options for an item
    $scope.getOptions = function(item) {
        // Store data as object and use in scope
        $scope.currentCategory = item;

        var currentOptions = [];

        // Get all category item keys
        var categoryItemKeyRefs = projectRef.child("categoryItems").child(item.key).child("refs");

        // Iterate through all keys from "categoryKeyRefs" and get data from "projectCategoryItemsRef"
        categoryItemKeyRefs.on('child_added', function(snapshot) {
            var itemKey = snapshot.key();
            projectRef.child("itemOptions").child(itemKey).on('value', function(snapshot) {
                $timeout(function() {
                    if( snapshot.val() === null ) {
                        delete $scope.itemOptions[itemKey];
                    }
                    else {
                        currentOptions.push(snapshot.val());
                    }
                });
            });
        });
        $scope.itemOptions = currentOptions;
    };

});