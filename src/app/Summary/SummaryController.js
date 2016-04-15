module.exports = function(app) {
    app.controller('SummaryController', function ($scope, $state, $stateParams, FireRef, $firebaseArray) {

        var projectKey = $stateParams.projectKey;
        var projectRef = FireRef.child(projectKey);

        // Init
        projectRef.onAuth(authDataCallback);

        function authDataCallback(authData) {
            if (authData) {
                var cartRef = projectRef.child("sessionCarts").child(authData.uid).child("cart");
                $scope.cart = $firebaseArray(cartRef);
            }
        }

        $scope.downloadPDF = function () {
            if ($scope.cart.length === 0) {
                return;
            }

            var myProject = {name: "Testprojekt"};
            var myCustomer = {Appartmentnumber: "1204", Date: "2016-04-14", customers: [{Firstname: "Kalle", Lastname: "Svensson"}, {Firstname: "Eva", Lastname: "Svensson"}]};
            var total = "1337";

            var doc = createPdf(myProject, myCustomer, $scope.cart, total);

            // Saving pdf
            doc.save('Sammanfattning.pdf');
        };

        function createPdf(project, customer, cart, total) {

            var doc = new jsPDF();

            var fontSize = 14;
            var margin = (fontSize/12 * 5);

            var customerInfo = {
                leftCol: 40,
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
                leftCol: 40,
                middleCol: 90,
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
                            return this.rightCol - (pricelength * (fontsize*2/10)) + (10 * fontsize*2/10);
                    }
                    return 0;
                }
            };

            // Heading
            doc.setFontSize(26);
            doc.text(40, 20, 'PROJEKTNAMN');

            // Customer info
            doc.setFontSize(fontSize);

            doc.text(customerInfo.col('left'), customerInfo.row(0), 'Lägenhetsnummer:');
            doc.text(customerInfo.col('right'), customerInfo.row(0), customer.Appartmentnumber);

            doc.text(customerInfo.col('left'), customerInfo.row(1), 'Upprättad datum:');
            doc.text(customerInfo.col('right'), customerInfo.row(1), customer.Date);

            doc.text(customerInfo.col('left'), customerInfo.row(2), 'Namn:');

            // Each customer
            customer.customers.forEach(function(person, index){
                doc.text(customerInfo.col('right'), customerInfo.row(2 + index), person.Firstname + ' ' + person.Lastname);
            });

            // Cart

            // Row1 - Labels
            doc.setFontType("bold");
            doc.text(cartInfo.col('left'), cartInfo.row(0), 'Tillval');
            doc.text(cartInfo.col('right'), cartInfo.row(0), 'Pris inkl moms');

            // LeftCol - category.titles
            doc.setFontType("normal");

            // Each Cart
            cart.forEach(function(item, index){
                var priceLength = item.price.toString().length + 1;

                doc.text(cartInfo.col('left'), cartInfo.row(1 + index), item.categoryTitle);
                doc.text(cartInfo.col('middle'), cartInfo.row(1 + index), item.title);
                doc.text(cartInfo.col('priceRight', priceLength, fontSize), cartInfo.row(1 + index), item.price + ' kr');
            });
            

            // Total
            doc.text(cartInfo.col('priceRight',total.toString().length + 1 , fontSize), cartInfo.row(1 + cart.length+1), total + ' kr');

            doc.setFontType("bold");
            doc.text(cartInfo.col('middle'), cartInfo.row(1 + cart.length+1), 'Summa tillval');

            return doc;
        }

    });
}