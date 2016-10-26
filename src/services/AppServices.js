module.exports = function (app) {
    app.factory("GetChildElementsByKey", ["$timeout", function ($timeout) {
        var ref = new Firebase("https://100meter.firebaseio.com/");
        return ref;
    }]);

    app.service('htmlHelper', function () {
        this.formatPrice = function (price) {
            var nStr = price.toString();
            nStr += '';
            x = nStr.split('.');
            x1 = x[0];
            x2 = x.length > 1 ? '.' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ' ' + '$2');
            }
            return x1 + x2;
        };
        this.countSpaces = function (priceLength, value) {
            if (!value) {
                value = 0;
            }
            var rest = priceLength - 3;
            if (rest > 0 && rest <= 3) {
                value++;
                return value;
            }
            if (rest > 3) {
                //Recursive: remove one from the rest
                return this.countSpaces(priceLength - 3 - 1, value + 1);
            }
            return value;
        };
        this.priceSuffix = function () {
            return ' kr';
        };
    });

    app.service('pdfHelper', ['htmlHelper', function (htmlHelper) {
        this.createPdf = function (projectSettings, customer, cart, total) {

            if (!projectSettings || !customer || !cart || !total) {
                debugger;
            }

            var doc = new jsPDF();

            var fontSize = 14;
            var margin = (fontSize / 12 * 5);

            var customerInfo = {
                leftCol: 20,
                rightCol: 120,
                rowStart: 50,
                rowMargin: margin,
                row: function (nr) {
                    return this.rowStart + (nr * this.rowMargin);
                },
                col: function (direction) {
                    if (direction === 'left') {
                        return this.leftCol;
                    } else {
                        return this.rightCol;
                    }
                }
            };

            var cartInfo = {
                leftCol: 20,
                middleCol: 80,
                rightCol: 160,
                rowStart: 100,
                rowMargin: margin,
                row: function (nr) {
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
                            var spaceSize = (spaceValue * (fontsize * 2 / 10) / 2);  // Moves to right
                            var priceFontSize = (10 * fontsize * 2 / 10);            // Moves to right
                            var priceSize = (pricelength * (fontsize * 2 / 10));   // Moves to left
                            return this.rightCol - priceSize + priceFontSize + spaceSize;
                    }
                    return 0;
                }
            };

            // Heading
            doc.setFontSize(26);
            doc.text(20, 20, 'Orderbekräftelse');

            doc.setFontSize(18);
            doc.text(20, 30, projectSettings.projectName);

            doc.setFontSize(fontSize);

            doc.text(customerInfo.col('left'), customerInfo.row(0), 'Lägenhetsnummer: ' + (customer.appartmentnumber ? customer.appartmentnumber : ""));
            doc.text(customerInfo.col('left'), customerInfo.row(1), 'Upprättad datum: ' + (customer.date ? customer.date : ""));

            // Customer
            doc.setFontType("bold");
            doc.text(customerInfo.col('left'), customerInfo.row(3), 'Kund');
            doc.setFontType("normal");

            doc.text(customerInfo.col('left'), customerInfo.row(4), customer.name ? customer.name : "");
            doc.text(customerInfo.col('left'), customerInfo.row(5), customer.phone ? customer.phone : "");
            doc.text(customerInfo.col('left'), customerInfo.row(6), customer.email ? customer.email : "");

            // Company
            doc.setFontType("bold");
            doc.text(customerInfo.col('right'), customerInfo.row(3), projectSettings.companyName ? projectSettings.companyName : "");
            doc.setFontType("normal");

            doc.text(customerInfo.col('right'), customerInfo.row(4), projectSettings.companyStreet ? projectSettings.companyStreet : "");
            doc.text(customerInfo.col('right'), customerInfo.row(5), (projectSettings.companyZip && projectSettings.companyCity ? projectSettings.companyZip + " " + projectSettings.companyCity : ""));
            doc.text(customerInfo.col('right'), customerInfo.row(6), projectSettings.companyPhone ? projectSettings.companyPhone : "");
            doc.text(customerInfo.col('right'), customerInfo.row(7), projectSettings.companyWebsite ? projectSettings.companyWebsite : "");

            // Cart

            // Row1 - Labels
            doc.setFontType("bold");
            doc.text(cartInfo.col('left'), cartInfo.row(0), 'Tillval');
            doc.text(cartInfo.col('right') + 10, cartInfo.row(0), 'Belopp');

            // LeftCol - category.titles
            doc.setFontType("normal");


            doc.setFontSize(fontSize - 2);

            // Object.keys(obj)
            // Each Cart

            // TODO: cart is now an object, not an array

            var offset = 1;

            //x y längd y
            doc.line(cartInfo.col('left'), cartInfo.row(offset - 1) + 2, 190, cartInfo.row(offset - 1) + 2); // horizontal line

            for (var category in cart) {
                // Title: cart[category].categoryTitle
                offset++;
                doc.setFontType("bold");
                doc.text(cartInfo.col('left'), cartInfo.row(offset), cart[category].categoryTitle);
                doc.setFontType("normal");
                offset++;


                for (var categoryItem in cart[category]) {


                    if (categoryItem != 'categoryTitle') {
                        var item = cart[category][categoryItem];

                        var formatedPrice = htmlHelper.formatPrice(item.price);
                        var priceLength = formatedPrice.toString().length;

                        doc.text(cartInfo.col('left'), cartInfo.row(offset), item.categoryItemTitle);
                        doc.text(cartInfo.col('middle'), cartInfo.row(offset), item.title);
                        doc.text(cartInfo.col('priceRight', priceLength, fontSize - 2), cartInfo.row(offset), htmlHelper.formatPrice(item.price) + htmlHelper.priceSuffix());

                        offset++;
                    }
                }
            }

            // Total
            var formatedTotal = htmlHelper.formatPrice(total);
            var totalLength = formatedTotal.toString().length;

            doc.text(cartInfo.col('priceRight', totalLength, fontSize), cartInfo.row(offset + 1), htmlHelper.formatPrice(total) + htmlHelper.priceSuffix());
            doc.setFontType("bold");
            doc.text(cartInfo.col('middle') + 40, cartInfo.row(offset + 1), 'Totalt inkl. moms:');

            //x y längd y
            doc.line(cartInfo.col('left'), cartInfo.row(offset), 190, cartInfo.row(offset)); // horizontal line

            return doc;
        }
    }]);

// READ UP ON
//http://stackoverflow.com/questions/21776237/angularjs-pass-variables-in-service
//https://www.firebase.com/docs/web/libraries/angular/guide/extending-services.html
//https://www.firebase.com/docs/web/libraries/angular/api.html#angularfire-extending-the-services
}
