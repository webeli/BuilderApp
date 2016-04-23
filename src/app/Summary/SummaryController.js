module.exports = function(app) {
    app.controller('SummaryController', ['$scope', '$state', '$stateParams', 'FireRef', '$firebaseArray', '$firebaseObject', 'htmlHelper', function ($scope, $state, $stateParams, FireRef, $firebaseArray, $firebaseObject, htmlHelper) {

        $scope.projectKey = $stateParams.projectKey;
        var projectRef = FireRef.child($scope.projectKey);

        $scope.htmlHelper = htmlHelper;
        $scope.validateCustomer = false;

        projectRef.child("pName").once("value", function(snapshot) {
           if (snapshot.val())
               $scope.projectTitle = snapshot.val();
        });

        // Init
        projectRef.onAuth(authDataCallback);

        function authDataCallback(authData) {
            if (authData) {
                var cartRef = projectRef.child("sessionCarts").child(authData.uid);

                $scope.authData = authData;
                $scope.cart = $firebaseArray(cartRef.child("cart"));

                var customerInfo = $firebaseObject(cartRef.child("customerInfo"));
                customerInfo.$loaded(
                    function(data) {
                        $scope.customer = data;
                        $scope.customer['date'] = new Date().toLocaleDateString();
                    }
                );

                var obj = $firebaseObject(cartRef.child("total"));
                obj.$bindTo($scope, "totalPrice");
            }
        }

        $scope.downloadPDF = function () {

            if ($scope.cart.length === 0 || !$scope.customer.appartmentnumber || !$scope.customer.customerOne) {
                $scope.validateCustomer = true;
                return;
            }

            var doc = createPdf($scope.projectTitle, $scope.customer, $scope.cart, $scope.totalPrice.$value);

            // Saving pdf
            doc.save('Sammanfattning.pdf');
        };

        function createPdf(projectname, customer, cart, total) {

            if (!projectname || !customer || !cart || !total) {
                debugger;
            }

            var doc = new jsPDF();

            var fontSize = 14;
            var margin = (fontSize/12 * 5);

            var customerInfo = {
                leftCol: 30,
                rightCol: 120,
                rowStart: 40,
                rowMargin: margin,
                row: function(nr) {
                    return this.rowStart + (nr * this.rowMargin);
                },
                col: function(direction) {
                    if (direction === 'left') {
                        return this.leftCol;
                    } else {
                        return this.rightCol;
                    }
                }
            };

            var cartInfo = {
                leftCol: 30,
                middleCol: 80,
                rightCol: 140,
                rowStart: 65,
                rowMargin: margin,
                row: function(nr) {
                    return this.rowStart + (nr * this.rowMargin);
                },
                col: function (direction, pricelength, fontsize) {
                    switch (direction) {
                        case 'left':
                            return this.leftCol;
                        case 'middle':
                            return this.middleCol;
                        case 'right':
                            return this.rightCol;
                        case 'priceRight':
                            var spaceValue = htmlHelper.countSpaces(pricelength);    // Value increases foreach 3
                            var spaceSize = (spaceValue * (fontsize*2/10)/2);  // Moves to right
                            var priceFontSize = (10 * fontsize*2/10);            // Moves to right
                            var priceSize = (pricelength * (fontsize*2/10));   // Moves to left
                            return this.rightCol - priceSize + priceFontSize + spaceSize;
                    }
                    return 0;
                }
            };

            // Heading
            doc.setFontSize(26);
            doc.text(40, 20, projectname.toUpperCase());

            // Customer info
            doc.setFontSize(fontSize);

            doc.text(customerInfo.col('left'), customerInfo.row(0), 'Lägenhetsnummer:');
            doc.text(customerInfo.col('right'), customerInfo.row(0), customer.appartmentnumber);

            doc.text(customerInfo.col('left'), customerInfo.row(1), 'Upprättad datum:');
            doc.text(customerInfo.col('right'), customerInfo.row(1), customer.date);

            doc.text(customerInfo.col('left'), customerInfo.row(2), 'Namn:');
            doc.text(customerInfo.col('right'), customerInfo.row(2), customer.customerOne);
            if (customer.customerTwo) {
                doc.text(customerInfo.col('right'), customerInfo.row(3), customer.customerTwo);
            }


            // Cart

            // Row1 - Labels
            doc.setFontType("bold");
            doc.text(cartInfo.col('left'), cartInfo.row(0), 'Tillval');
            doc.text(cartInfo.col('right'), cartInfo.row(0), 'Pris inkl moms');

            // LeftCol - category.titles
            doc.setFontType("normal");

            // Each Cart
            cart.forEach(function(item, index){
                var formatedPrice = htmlHelper.formatPrice(item.price);
                var priceLength = formatedPrice.toString().length;

                doc.text(cartInfo.col('left'), cartInfo.row(1 + index), item.categoryTitle);
                doc.text(cartInfo.col('middle'), cartInfo.row(1 + index), item.title);
                doc.text(cartInfo.col('priceRight', priceLength, fontSize), cartInfo.row(1 + index), htmlHelper.formatPrice(item.price) + htmlHelper.priceSuffix());
            });
            

            // Total
            var formatedTotal = htmlHelper.formatPrice(total);
            var totalLength = formatedTotal.toString().length;


            doc.text(cartInfo.col('priceRight', totalLength, fontSize), cartInfo.row(1 + cart.length+1), htmlHelper.formatPrice(total) + htmlHelper.priceSuffix());

            doc.setFontType("bold");
            doc.text(cartInfo.col('middle'), cartInfo.row(1 + cart.length+1), 'Summa tillval');

            return doc;
        }

    }]);
}