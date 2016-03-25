app.controller('AccountEditController', function($scope, FireRef, $stateParams, $firebaseArray, $timeout, $state) {
    console.log("AccountEditController");

    var projectKey = $stateParams.projectKey;
    var projectRef = FireRef.child($stateParams.projectKey);

    // Check if project exists, else go to my-projects
    projectRef.once("value", function(snapshot) {
        var projectKey = snapshot.exists();
        if (projectKey === false) {
            $state.go("account.myprojects");
        }
    });

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
    $scope.loddar = true;

    // Add category
    $scope.addCategory = function () {
        var data = prompt("Ange något");
        projectCategoryRef.push({
            title: data
        });
    };

    // Adds a category to the project
    $scope.addItem = function (id) {
        var data = prompt("Ange något");
        var categoryItemsRef = projectCategoryItemsRef.push();
        var categoryItemsKey = categoryItemsRef.key();

        // Add reference key to category and data to categoryItems node
        categoryItemsRef.set({title: data, key: categoryItemsKey});
        projectCategoryRef.child(id).child("refs").child(categoryItemsKey).set(true);

        $scope.getItems(id);
    };

    //Adds a option to an item
    $scope.addOption = function (id) {
        var data = prompt("Ange något");
        var itemOptionsRef = projectItemOptionsRef.push();
        var itemOptionsKey = itemOptionsRef.key();

        // Add reference key to category and data to categoryItems node
        itemOptionsRef.set({
            title: data,
            key: itemOptionsKey,
            price: 0,
            default: false,
            desc: '',
            active: true
        });
        projectCategoryItemsRef.child(id).child("refs").child(itemOptionsKey).set(true);
    }

    // Gets the items in a category
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

    // Get the options for an item
    $scope.getOptions = function(item, categoryName) {
        // Store data as object and use in scope
        $scope.imgCategory = categoryName;
        $scope.imgItem = item.title;
        $scope.itemOptions = {};

        // Get all category item keys
        var categoryItemKeyRefs = FireProjectRef.child("categoryItems").child(item.key).child("refs");

        // Iterate through all keys from "categoryKeyRefs" and get data from "projectCategoryItemsRef"
        categoryItemKeyRefs.on('child_added', function(snapshot) {
            var itemKey = snapshot.key();
            projectItemOptionsRef.child(itemKey).on('value', function(snapshot) {
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

    $scope.enterCategoryItem = function(item, categoryName) {

        var ref = projectCategoryItemsRef.child(item.key);

        // Attach an asynchronous callback to read the data at our posts reference
        ref.on("value", function(snapshot) {
            $scope.selectedItem = snapshot.val();
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });

        $scope.getOptions(item, categoryName);
    };

    $scope.saveOptionItem = function(item, menuRef) {
        console.log(item.active);
        var myRef = projectItemOptionsRef.child(item.key);
        myRef.update({
            title: item.title,
            price: item.price,
            default: item.default,
            desc: item.desc,
            active: item.active
        }, onComplete());

        function onComplete() {
            console.log("complete");
        };
    }

});