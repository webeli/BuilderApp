module.exports = function(app) {
    app.controller('AccountEditController', ['$scope', 'FireRef', '$stateParams', '$firebaseArray', '$firebaseObject', '$timeout', '$state', function($scope, FireRef, $stateParams, $firebaseArray, $firebaseObject, $timeout, $state) {

        var projectKey = $stateParams.projectKey;
        var projectRef = FireRef.child($stateParams.projectKey);

        // Check if project exists, else go to my-projects
        projectRef.once("value", function (snapshot) {
            var projectKey = snapshot.exists();
            if (projectKey === false) {
                $state.go("account.myprojects");
            }
        });

        // Base ref for project
        var FireProjectRef = FireRef.child(projectKey);

        // Firebase references
        var projectCategoryRef = FireProjectRef.child("categories");
        var projectCategoryItemsRef = FireProjectRef.child("categoryItems");
        var projectItemOptionsRef = FireProjectRef.child("itemOptions");

        // Get as firebaseArray
        var projectCategoryArray = $firebaseArray(FireProjectRef.child("categories"));

        // Starting $scope variables
        $scope.oneAtATime = true;
        $scope.categories = projectCategoryArray;
        $scope.loddar = true;
        $scope.EditOptionData = {};
        $scope.allCategories = [];

        $scope.modalAddCategory = false;
        $scope.modalAddItem = false;
        $scope.modalAddOption = false;
        $scope.modalEditOption = false;

        /*
         ** Init
         */
        getAllCategories();

        function getAllCategories() {
            var categoriesRef = projectRef.child("categories");
            var categoriesFirebaseArray = $firebaseArray(categoriesRef);

            categoriesFirebaseArray.$loaded().then(function (categories) {
                var allCats = [];

                angular.forEach(categories, function (category) {
                    var categoryWithItems = getCategoryItem(category);
                    allCats.push(categoryWithItems);
                });
                $scope.allCategories = allCats;
            });

            return true;
        }

        function getCategoryItem(category) {
            category['categoryItems'] = [];

            angular.forEach(category.refs, function (key) {

                var categoryItemsRef = projectRef.child("categoryItems");
                var categoryItemRef = categoryItemsRef.child(key);

                categoryItemRef.on('value', function (snap) {
                    $timeout(function () {
                        category.categoryItems.push(snap.val());
                    });
                });

            }, category.categoryItems); //forEach

            return category;
        }

        // Toggle modal
        $scope.toggleModal = function (modal, key) {
            if (modal === "category") {
                $scope.modalAddCategory = !$scope.modalAddCategory;
            }
            if (modal === "item") {
                $scope.modalAddItem = !$scope.modalAddItem;
                $scope.addItemKey = key;
            }
            if (modal === "addoption") {
                $scope.modalAddOption = !$scope.modalAddOption;
                $scope.addOptionKey = key;
            }
            if (modal === "editoption") {
                $scope.modalEditOption = !$scope.modalEditOption;
                $scope.loadEditOption(key);
            }
        };

        // Load EditOption
        $scope.loadEditOption = function (key) {
            console.log("Load Edit Option");
            var data = $firebaseObject(projectItemOptionsRef.child(key));
            data.$loaded().then(function (data) {
                console.log(data);
                $scope.EditOptionData = data;
            });
        };

        // Add category
        $scope.addCategory = function (data) {
            projectCategoryRef.push({
                title: data.title
            });
            // Close modal
            $scope.modalAddCategory = false;
        };

        // Adds a category to the project
        $scope.addItem = function (data) {
            var id = $scope.addItemKey;
            var categoryItemsRef = projectCategoryItemsRef.push();
            var categoryItemsKey = categoryItemsRef.key();
            // Add reference key to category and data to categoryItems node
            categoryItemsRef.set({title: data.title, key: categoryItemsKey});
            projectCategoryRef.child(id).child("refs").child(categoryItemsKey).set(categoryItemsKey);
            // Close modal
            $scope.modalAddItem = false;
            getAllCategories();
        };

        // Adds an option to an item
        $scope.addOption = function (data) {
            var id = $scope.addOptionKey;
            var itemOptionsRef = projectItemOptionsRef.push();
            var itemOptionsKey = itemOptionsRef.key();

            // Add reference key to category and data to categoryItems node
            itemOptionsRef.set({
                title: data.title,
                key: itemOptionsKey,
                price: 0,
                default: false,
                attribute: '',
                desc: '',
                active: true,
                image: 'http://senda-arcoiris.info/images/100x100.gif'
            });
            projectCategoryItemsRef.child(id).child("refs").child(itemOptionsKey).set(itemOptionsKey);
            // Close modal
            $scope.modalAddOption = false;
        };

        $scope.uploadImage = function () {
            // TODO: Store API key in firebase under Authenticated admin node
            filepicker.setKey("Axj8r9t8RAKP5R3oUw8J9z");
            filepicker.pick(
                function (data) {
                    $scope.EditOptionData.image = data.url;
                    $scope.$apply();
                }
            );
        };

        $scope.deleteImage = function (data) {
            var optionImageRef = projectItemOptionsRef.child(data.$id).child("image");
            optionImageRef.set('http://senda-arcoiris.info/images/100x100.gif');
        };

        // Enter category item
        $scope.enterCategoryItem = function (item, categoryName) {
            console.log("enterCategoryItem");
            var ref = projectCategoryItemsRef.child(item.key);
            ref.on("value", function (snapshot) {
                $scope.selectedItem = snapshot.val();
            }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);
            });

            $scope.getOptions(item, categoryName);
        };

        // Gets the items in a category
        /*
        $scope.getItems = function (key) {
            console.log("getItems");
            // Store data as object and use in scope
            $scope.categoryItems = {};

            // Get all category item keys
            var categoryKeyRefs = FireProjectRef.child("categories").child(key).child("refs");

            // Iterate through all keys from "categoryKeyRefs" and get data from "projectCategoryItemsRef"
            categoryKeyRefs.on('child_added', function (snapshot) {
                var itemKey = snapshot.key();
                projectCategoryItemsRef.child(itemKey).on('value', function (snapshot) {
                    $timeout(function () {
                        if (snapshot.val() === null) {
                            delete $scope.categoryItems[itemKey];
                        }
                        else {
                            $scope.categoryItems[itemKey] = snapshot.val();
                        }
                    });
                });
            });
        };*/

        // Get the options for an item
        $scope.getOptions = function (item, categoryName) {
            console.log("getOptions");
            // Store data as object and use in scope
            $scope.imgCategory = categoryName;
            $scope.imgItem = item.title;
            $scope.itemOptions = {};

            // Get all category item keys
            var categoryItemKeyRefs = FireProjectRef.child("categoryItems").child(item.key).child("refs");

            // Iterate through all keys from "categoryKeyRefs" and get data from "projectCategoryItemsRef"
            categoryItemKeyRefs.on('child_added', function (snapshot) {
                var itemKey = snapshot.key();
                projectItemOptionsRef.child(itemKey).on('value', function (snapshot) {
                    $timeout(function () {
                        if (snapshot.val() === null) {
                            delete $scope.itemOptions[itemKey];
                        }
                        else {
                            $scope.itemOptions[itemKey] = snapshot.val();
                        }
                    });
                });
            });
        };

        // Save option item
        $scope.saveEditOption = function (item) {
            var myRef = projectItemOptionsRef.child(item.key);
            myRef.update({
                title: item.title,
                price: item.price,
                attribute: item.attribute || '',
                default: item.default,
                desc: item.desc,
                active: item.active,
                image: item.image
            }, onComplete());

            function onComplete() {
                console.log("complete");
                //close modal
                $scope.modalEditOption = false;
            };
        }

    }]);
}