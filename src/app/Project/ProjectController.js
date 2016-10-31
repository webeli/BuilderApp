module.exports = function (app) {
    app.controller('ProjectController', ['$scope', 'FireRef', '$stateParams', '$state', '$firebaseArray', '$firebaseObject', '$timeout', 'htmlHelper', '$filter', 'moment', 'pdfHelper', '$http', function ($scope, FireRef, $stateParams, $state, $firebaseArray, $firebaseObject, $timeout, htmlHelper, $filter, moment, pdfHelper, $http) {

        /*
         ** Refs
         */
        var projectKey = $stateParams.projectKey;
        var projectRef = FireRef.child(projectKey);

        /*
         ** Scope variables
         */

        // Helpers
        $scope.htmlHelper = htmlHelper;
        $scope.pdfHelper = pdfHelper;

        // Objects
        $scope.cart = null;
        $scope.projectSettings = {};

        // Arrays
        $scope.allCategories = [];

        // Bool
        $scope.displayLightbox = false;
        $scope.areYouSureDialog = false;
        $scope.showStartPage = true;
        $scope.showCorrection = false;

        // Vars
        $scope.currentCategoryItem = null;

        /*
         ** Init
         */
        getProjectSettings();
        getAllCategories();
        getUser();

        /*
         ** Private functions
         */
        function getProjectSettings() {
            projectRef.child("projectSettings").once("value", function (snapshot) {
                var projectKey = snapshot.exists();
                if (projectKey === false) {
                    $state.go("home");
                } else {
                    $scope.projectSettings = snapshot.val();
                    setDeadLine(snapshot.val().projectDeadline);
                }
            });
        }

        function setDeadLine(data) {
            console.log(data);
            var getDeadline = moment(new Date(data));
            var getToday = moment(Date.now());
            $scope.daysUntilDeadline = "Slutdatum: "+data+" ("+getDeadline.diff(getToday, 'days') + " dagar kvar)";
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

        function allValid() {
            statement = true;
            angular.forEach($scope.allCategories, function(categoryItem) {
                angular.forEach(categoryItem.categoryItems, function(itemOption) {

                    var inCart = $scope.inCart(itemOption.key);

                    if (!inCart) {
                        statement = false;
                    }
                });
            });
            return statement;
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
                if (snapshot.val() || snapshot.val() == 0) {
                    $scope.totalPrice = snapshot.val();
                }
            });

            var customerInfoRef = projectRef.child("sessionCarts").child($scope.myKey);

            var customerInfo = $firebaseObject(customerInfoRef.child("customerInfo"));
            customerInfo.$loaded(
                function (data) {
                    $scope.customer = data;
                }
            );
        }

        /*
         ** Scope functions
         */
        $scope.selectOption = function (itemOption, categoryItem, fullPageItem, added) {
            // Make it an object
            if ($scope.cart == null) {
                $scope.cart = {};
            }

            if (fullPageItem) {
                var data = {
                    title: added ? "Ja" : "Nej",
                    price: added ? itemOption.price : 0,
                    key: itemOption.key,
                    categoryItemTitle: categoryItem.title
                }
            } else {
                var data = {
                    title: itemOption.title,
                    price: itemOption.price,
                    key: itemOption.key,
                    categoryItemTitle: categoryItem.title
                };
            }

            if ($scope.cart[$scope.currentCategory.$id] === undefined) {
                $scope.cart[$scope.currentCategory.$id] = {categoryTitle: $scope.currentCategory.title};
            }

            $scope.cart[$scope.currentCategory.$id][categoryItem.key] = data;

            var cartRef = projectRef.child("sessionCarts").child($scope.myKey).child("cart");
            cartRef.set($scope.cart);

            projectRef.child("sessionCarts").child($scope.myKey).child("total").set($scope.getTotal());
        };

        $scope.zoomItemOption = function (item) {
            $scope.lightboxImage = "./assets/loader50.gif";
            $scope.displayLightbox = !$scope.displayLightbox;
            $timeout(function () {
                $scope.lightboxData = item;
                $scope.lightboxImage = $scope.lightboxData.image;
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

        // Get the options for an item
        $scope.getItemOptions = function (item, category) {

            // TODO;
            // Maybe store each load in the view so that we don't have to repeat this process.
            // For now: empty it so that the site doesn't feel laggy when switching categories

            //Empty and reset
            $scope.showStartPage = false;
            $scope.itemOptions = [];

            // Store data as object and use in scope
            $scope.currentCategoryItem = item;
            $scope.currentCategory = category;

            var counter = 0;
            var allItems = {standard: [], tillval: []};

            // Get node "refs" on category
            var categoryItemKeyRefs = projectRef.child("categoryItems").child(item.key).child("refs");

            // Iterate through all keys from "categoryKeyRefs" and get data from "projectCategoryItemsRef"
            categoryItemKeyRefs.on('child_added', function (snapshot) {

                var itemKey = snapshot.key;
                counter++;

                projectRef.child("itemOptions").child(itemKey).orderByChild("default").once('value', function (snapshot) {
                    $timeout(function () {
                        if (snapshot.val() === null) {
                            delete $scope.itemOptions[itemKey];
                            counter--;
                        }
                        else {
                            if (snapshot.val().default) {
                                allItems.standard.push(snapshot.val());
                            } else {
                                allItems.tillval.push(snapshot.val());
                            }
                        }

                        if (counter === allItems.standard.length + allItems.tillval.length) {
                            getItemOptionsCallback(allItems);
                        }

                    });

                });
            });
            // Sort it:
            function getItemOptionsCallback(items) {
                var orderBy = $filter('orderBy');

                $scope.itemOptions = {
                    standard: {
                        name: "Standard",
                        items: orderBy(items.standard, ['default', 'price'])
                    },
                    tillval: {
                        name: "Tillval",
                        items: orderBy(items.tillval, ['default', 'price'])
                    }
                };
                console.log($scope.itemOptions);

                // TODO: scroll into view? async problem
            }
        };

        // Toggle modal
        $scope.toggleModal = function (modal) {

            if (!allValid()) {
                $scope.showCorrection = true;
                //TODO: find different solution
                $(".navbar-toggle:visible").click();
                return true;
            }

            $scope.showCorrection = true;

            if (modal === "summary") {
                $scope.modalSummary = !$scope.modalSummary;
            }
        };

        $scope.inCart = function (key) {
            for (var categoryItem in $scope.cart) {
                if (typeof($scope.cart[categoryItem][key]) == "object")
                {
                    return true;
                }
            }
            return false;
        };

        $scope.saveAndConfirm = function () {

            $scope.customer.project = projectKey;
            //Sets the format date
            $scope.customer.date = moment().format("YYYY-MM-DD");
            $scope.customer.$save();
            $scope.sendingMail = true;

            $http({
                method: 'POST',
                url: 'https://builderappmail.herokuapp.com/',
                data: {projectKey: projectKey, customerKey: $scope.myKey}
            }).then(function successCallback(response) {

                $scope.sendingMail = false;
                $scope.areYouSureDialog = false;

                $scope.confirmCustomer(true);

            }, function errorCallback(response) {
                $scope.sendingMail = false;
                console.log("failure:", response);
            });
        };

        $scope.confirmCustomer = function () {
            $scope.customer.confirmed = true;
            $scope.customer.$save();
        };

        $scope.downloadPDF = function () {

            var doc = $scope.pdfHelper.createPdf($scope.projectSettings, $scope.customer, $scope.cart, $scope.totalPrice);
            // Saving pdf
            doc.save('Sammanfattning.pdf');
        };

    }]);
};
