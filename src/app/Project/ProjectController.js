module.exports = function(app) {
    app.controller('ProjectController', ['$scope', 'FireRef', '$stateParams', '$state', '$firebaseArray', '$firebaseObject', '$timeout', 'htmlHelper', '$filter', 'moment', 'pdfHelper', '$http', function($scope, FireRef, $stateParams, $state, $firebaseArray, $firebaseObject, $timeout, htmlHelper, $filter, moment, pdfHelper, $http) {

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

        // Helpers
        $scope.htmlHelper = htmlHelper;
        $scope.pdfHelper = pdfHelper;

        // Objects
        $scope.cart = null;

        // Arrays
        $scope.allCategories = [];

        // Bool
        $scope.displayLightbox = false;
        $scope.customerConfirmInfo = false;

        // Vars
        $scope.currentCategoryItem = null;
        $scope.projectTitle = null;

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
            $scope.myKey = localStorage.getItem("userKey");
            if (!$scope.myKey) {
                $scope.myKey = createNewCart();
            }
            bindCart($scope.myKey);
        }

        function createNewCart() {
            var ref = projectRef.child("sessionCarts").push();
            var key = ref.key;
            localStorage.setItem("userKey", key);

            return key;
        }

        function bindCart(key) {
            var ref = projectRef.child("sessionCarts").child(key).child("cart");
            ref.on("value", function (snapshot) {
                if (snapshot.val()) {
                    $scope.cart = snapshot.val();
                }
            });
            var totalRef = projectRef.child("sessionCarts").child(key).child("total");
            totalRef.on("value", function (snapshot) {
                if (snapshot.val()) {
                    $scope.totalPrice = snapshot.val();
                }
            });

            var customerInfoRef = projectRef.child("sessionCarts").child($scope.myKey);

            var customerInfo = $firebaseObject(customerInfoRef.child("customerInfo"));
            customerInfo.$loaded(
                function(data) {
                    $scope.customer = data;
                }
            );
        }

        /*
         ** Scope functions
         */
        $scope.selectOption = function (itemOption, categoryItem, value) {
            // Make it an object
            if ($scope.cart == null) { $scope.cart = {}; }

            if (value) {
                var currentItem = {
                    title: itemOption.title,
                    price: itemOption.price,
                    key: itemOption.key,
                    categoryItemTitle: categoryItem.title
                    //categoryTitle: $scope.currentCategory.title /dont need right now i think
                };

                if ($scope.cart[$scope.currentCategory.$id] === undefined) {
                    $scope.cart[$scope.currentCategory.$id] = {categoryTitle: $scope.currentCategory.title};
                }

                $scope.cart[$scope.currentCategory.$id][categoryItem.key] = currentItem;

            } else {
                projectRef.child("sessionCarts").child($scope.myKey).child("cart").child($scope.currentCategory.$id).child(categoryItem.key).remove();
            }

            var cartRef = projectRef.child("sessionCarts").child($scope.myKey).child("cart");
            cartRef.set($scope.cart);

            projectRef.child("sessionCarts").child($scope.myKey).child("total").set($scope.getTotal());
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
            angular.forEach($scope.cart, function (categoryItems) {
                for (var item in categoryItems) {
                    if (item != 'categoryTitle') {
                        total += categoryItems[item].price;
                    }
                }
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
        $scope.getItemOptions = function (item, category) {
            // TODO;
            // Maybe store each load in the view so that we don't have to repeat this process.

            // For now: empty it so that the site doesn't feel laggy when switching categories

            $scope.itemOptions = [];

            // Store data as object and use in scope
            $scope.currentCategoryItem = item;
            $scope.currentCategory = category;

            var counter = 0;
            var result = [];

            // Get node "refs" on category
            var categoryItemKeyRefs = projectRef.child("categoryItems").child(item.key).child("refs");

            // Iterate through all keys from "categoryKeyRefs" and get data from "projectCategoryItemsRef"
            categoryItemKeyRefs.on('child_added', function (snapshot) {

                var itemKey = snapshot.key;
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
                            getItemOptionsCallback(result);
                        }

                    });

                });
            });
            // Sort it:
            function getItemOptionsCallback (result) {
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

        $scope.saveAndConfirm = function() {

            $scope.customer.project = projectKey;
            $scope.customer.date = new Date().toLocaleDateString();
            $scope.customer.$save();

            $http({
                method: 'POST',
                url: 'https://builderappmail.herokuapp.com/',
                data: {key:$scope.myKey}
            }).then(function successCallback(response) {
                $scope.customerConfirmInfo = false;
                $scope.customer.confirmed = true;
            }, function errorCallback(response) {
                console.log("failure:", response);
            });
        };

        $scope.downloadPDF = function () {

            var doc = $scope.pdfHelper.createPdf($scope.projectTitle, $scope.customer, $scope.cart, $scope.totalPrice);
            // Saving pdf
            doc.save('Sammanfattning.pdf');
        };

    }]);
};
