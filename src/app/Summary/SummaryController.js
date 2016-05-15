module.exports = function(app) {
    app.controller('SummaryController', ['$scope', '$state', '$stateParams', 'FireRef', '$firebaseArray', '$firebaseObject', 'htmlHelper', '$filter', function ($scope, $state, $stateParams, FireRef, $firebaseArray, $firebaseObject, htmlHelper, $filter) {

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

                var unsortedCart = $firebaseArray(cartRef.child("cart"));
                unsortedCart.$loaded()
                    .then(function(data) {
                        var orderBy = $filter('orderBy');
                        $scope.cart = orderBy(data, ['-categoryTitle']);
                    });

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


            var doc = createPdf($scope.projectTitle, $scope.customer, $scope.cart, $scope.totalPrice.$value);

            // Saving pdf
            doc.save('Sammanfattning.pdf');
        };

        $scope.saveAndConfirm = function () {
            var result = confirm("Är du säker?");
            if (result) {
                $scope.customer.confirmed = true;
                $scope.customer.$save();
            }
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


            var offset = 2;
            doc.setFontSize(fontSize-2);

            // Each Cart
            cart.forEach(function(item, index){
                var formatedPrice = htmlHelper.formatPrice(item.price);
                var priceLength = formatedPrice.toString().length;

                // Prints out category titles
                if (index == 0) {
                    doc.setFontType("bold");
                    doc.text(cartInfo.col('left'), cartInfo.row(offset), item.categoryTitle);
                    offset++;
                    doc.setFontType("normal");

                } else if (cart[index-1].categoryTitle != cart[index].categoryTitle) {
                    doc.setFontType("bold");
                    offset ++;
                    doc.text(cartInfo.col('left'), cartInfo.row(offset + index), item.categoryTitle);
                    offset ++;
                    doc.setFontType("normal");
                }

                // Each item
                doc.text(cartInfo.col('left'), cartInfo.row(offset + index), item.categoryItemTitle);
                doc.text(cartInfo.col('middle'), cartInfo.row(offset + index), item.title);
                doc.text(cartInfo.col('priceRight', priceLength, fontSize-2), cartInfo.row(offset + index), htmlHelper.formatPrice(item.price) + htmlHelper.priceSuffix());
            });
            

            // Total
            var formatedTotal = htmlHelper.formatPrice(total);
            var totalLength = formatedTotal.toString().length;


            doc.text(cartInfo.col('priceRight', totalLength, fontSize), cartInfo.row(offset + cart.length+1), htmlHelper.formatPrice(total) + htmlHelper.priceSuffix());

            doc.setFontType("bold");
            doc.text(cartInfo.col('middle'), cartInfo.row(offset + cart.length+1), 'Summa tillval');

            return doc;
        }

    }]);
}