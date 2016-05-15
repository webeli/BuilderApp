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
            $scope.daysUntilDeadline = getDeadline.diff(getToday, 'days') + " dagar kvar";
        });

        /*
         ** Scope variables
         */
        $scope.displayLightbox = false;
        $scope.htmlHelper = htmlHelper;
        $scope.projectKey = projectKey;
        $scope.allCategories = [];
        $scope.currentCategoryItem = null;
        $scope.imgCategory = null;
        $scope.imgItem = null;
        $scope.projectTitle = null;
        $scope.zoomedItem = null;
        $scope.authData = projectRef.getAuth();
        $scope.cart = {};
        $scope.cartIndex = [];

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
            var cartRef = projectRef.child("sessionCarts").child($scope.authData.uid).child("cart");
            var cartArray = $firebaseArray(cartRef);
            $scope.cartArray = cartArray;
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
                    categoryItemTitle: cat.title,
                    categoryTitle: $scope.currentCategoryTitle
                };

            } else {
                projectRef.child("sessionCarts").child($scope.authData.uid).child("cart").child(cat.key).remove();
            }

            var cartRef = projectRef.child("sessionCarts").child($scope.authData.uid).child("cart");
            cartRef.set($scope.cart);
            projectRef.child("sessionCarts").child($scope.authData.uid).child("total").set($scope.getTotal());
        };

        $scope.zoomItemOption = function (item) {
            $scope.lightboxImage = "./assets/loader.gif";
            $scope.displayLightbox = !$scope.displayLightbox;
            $timeout(function() {
                $scope.lightboxData = item;
                $scope.lightboxImage = "https://process.filestackapi.com/Axj8r9t8RAKP5R3oUw8J9z/resize=width:1024,fit:max/" + $scope.lightboxData.image;
            }, 10);
        };

        $scope.getTotal = function () {
            var total = 0;
            angular.forEach($scope.cart, function (item) {
                total += item.price;
            });
            return total;
        };

        $scope.getItemOptions = function (key) {
            var itemOption = projectRef.child("itemOptions").child(key);

            itemOption.on('value', function (snap) {
                $timeout(function () {
                    $scope.list = snap.val();
                });
            });
        };

        // Get the options for an item
        $scope.getOptions = function (item, categoryTitle) {
            // TODO;
            // Maybe store each load in the view so that we don't have to repeat this process.

            // For now: empty it so that the site doesn't feel laggy when switching categories

            $scope.itemOptions = [];

            // Store data as object and use in scope
            $scope.currentCategoryItem = item;
            $scope.currentCategoryTitle = categoryTitle;
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
            // Sort it:
            function getOptionsCallback (result) {
                var orderBy = $filter('orderBy');
                $scope.itemOptions = orderBy(result, ['-default', 'attribute', 'price']);
            }
        };

        // Toggle modal
        $scope.toggleModal = function (modal) {
            if (modal === "summary") {
                $scope.modalSummary = !$scope.modalSummary;
            }
        };

        $scope.confirm = function() {
            $scope.modalSummary = false;
            $(".modal-backdrop").remove();
            $state.go("summary", { "projectKey": $scope.projectKey });
        };

    }]);
}
