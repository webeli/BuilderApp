module.exports = function(app) {
    app.controller('ProjectController', ['$scope', 'FireRef', '$stateParams', '$state', '$firebaseArray', '$firebaseObject', '$timeout', 'htmlHelper', '$filter', 'moment', function ($scope, FireRef, $stateParams, $state, $firebaseArray, $firebaseObject, $timeout, htmlHelper, $filter, moment) {

        /*
         ** Refs
         */
        var projectKey = $stateParams.projectKey;
        var projectRef = FireRef.child(projectKey);

        // Get days until deadline
        projectRef.child("deadline").on('value', function(data) {
            var getDeadline = moment(new Date(data.val()));
            var getToday = moment(Date.now());
            $scope.daysUntilDeadline = getDeadline.diff(getToday, 'days') + " days until deadline";
        });

        /*
         ** Scope variables
         */
        $scope.displayLightbox = false;
        $scope.htmlHelper = htmlHelper;
        $scope.projectKey = projectKey;
        $scope.allCategories = [];
        $scope.currentCategory = null;
        $scope.imgCategory = null;
        $scope.imgItem = null;
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
            projectRef.once("value", function (snapshot) {
                var projectKey = snapshot.exists();
                if (projectKey === false) {
                    $state.go("home");
                } else {
                    $scope.projectTitle = snapshot.val().pName;
                }
            });
        }

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

        function getUser() {
            if (!projectRef.getAuth()) {
                projectRef.authAnonymously(function (error, authData) {
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
            var totalRef = projectRef.child("sessionCarts").child(uid).child("total");
            totalRef.on("value", function (snapshot) {
                if (snapshot.val()) {
                    $scope.totalPrice = snapshot.val();
                }
            });
        }

        /*
         ** Scope functions
         */
        $scope.selectOption = function (itemOption, cat, value) {
            if (value) {
                $scope.cart[cat.key] = {
                    title: itemOption.title,
                    price: itemOption.price,
                    key: itemOption.key,
                    categoryTitle: cat.title
                };
            } else {
                projectRef.child("sessionCarts").child($scope.authData.uid).child("cart").child(cat.key).remove();
            }

            projectRef.child("sessionCarts").child($scope.authData.uid).child("cart").set($scope.cart);

            projectRef.child("sessionCarts").child($scope.authData.uid).child("total").set($scope.getTotal());
        };

        $scope.zoomItemOption = function (item, zoom) {
            $scope.displayLightbox = !$scope.displayLightbox;
            $scope.lightboxData = item;
        };

        $scope.getTotal = function () {
            var total = 0;
            angular.forEach($scope.cart, function (item) {
                total += item.price;
            });
            return total;
        };

        $scope.getItemOptions = function (key) {
            console.log(key);
            var itemOption = projectRef.child("itemOptions").child(key);
            console.log(itemOption);

            itemOption.on('value', function (snap) {
                $timeout(function () {
                    $scope.list = snap.val();
                });
            });
        };

        // Get the options for an item
        $scope.getOptions = function (item) {

            // TODO
            // Maybe store each load in the view so that we don't have to repeat this process.

            // For now: empty it so that the site doesn't feel laggy when switching categories
            
            $scope.itemOptions = [];
            
            // Store data as object and use in scope
            $scope.currentCategory = item;
            $scope.zoomedItem = null;

            var counter = 0;
            var result = [];

            // Get node "refs" on category
            var categoryItemKeyRefs = projectRef.child("categoryItems").child(item.key).child("refs");

            // Iterate through all keys from "categoryKeyRefs" and get data from "projectCategoryItemsRef"
            categoryItemKeyRefs.on('child_added', function (snapshot) {

                var itemKey = snapshot.key();
                counter++;

                projectRef.child("itemOptions").child(itemKey).once('value', function (snapshot) {
                    $timeout(function () {
                        if (snapshot.val() === null) {
                            delete $scope.itemOptions[itemKey];
                            counter--;
                        }
                        else {
                            result.push(snapshot.val());
                        }

                        if (counter === result.length) {
                            getOptionsCallback(result);
                        }

                    });

                });
            });

            function getOptionsCallback (result) {
                // Sort it:
                var orderBy = $filter('orderBy');

                $scope.itemOptions = orderBy(result, ['-default', 'attribute', 'price']);

                console.log($scope.itemOptions);


            }
        };

    }]);
}