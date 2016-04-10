app.controller('ProjectController', function($scope, FireRef, $stateParams, $state, $firebaseArray, $firebaseObject, $timeout, FireAuth) {

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
    $scope.zoomedItem = null;
    $scope.authData = projectRef.getAuth();
    $scope.cart = {};

    /*
    ** Init
    */
    validateProjectKey();
    getAllCategories();
    getUser();

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

    function getUser() {
        if (!projectRef.getAuth()) {
            projectRef.authAnonymously(function(error, authData) {
                if (error) {
                    console.log("Login Failed!", error);
                } else {
                    $scope.authData = authData;
                    bindCart(authData.uid);
                }
            });
        } else {
            bindCart($scope.authData.uid);
        }
    }

    function bindCart(uid) {
        var ref = projectRef.child("sessionCarts").child(uid).child("cart");
        ref.on("value", function (snapshot) {
           if (snapshot.val()) {
               $scope.cart = snapshot.val();
           }
        });
    }

    /*
    ** Scope functions
    */
    $scope.selectOption = function (itemOption, cat, value) {
        if (value) {
            $scope.cart[cat.key] = {title: itemOption.title, price: itemOption.price, key: itemOption.key, categoryTitle: cat.title};
        } else {
            projectRef.child("sessionCarts").child($scope.authData.uid).child("cart").child(cat.key).remove();
        }

        projectRef.child("sessionCarts").child($scope.authData.uid).child("cart").set($scope.cart);
    };

    $scope.zoomItemOption = function (item) {
        $scope.zoomedItem != item ? $scope.zoomedItem = item : $scope.zoomedItem = null;
    };


    $scope.getTotal = function(){
        var total = 0;
        angular.forEach($scope.cart, function(item){
            total += item.price;
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
        $scope.zoomedItem = null;
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