module.exports = function(app) {
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
            if (rest > 0  && rest <= 3) {
                value++;
                return value;
            }
            if (rest > 3) {
                //Recursive: remove one from the rest
                return this.countSpaces(priceLength - 3-1, value+1);
            }
            return value;
        };
        this.priceSuffix = function () {
            return ' kr';
        };
    });

// READ UP ON
//http://stackoverflow.com/questions/21776237/angularjs-pass-variables-in-service
//https://www.firebase.com/docs/web/libraries/angular/guide/extending-services.html
//https://www.firebase.com/docs/web/libraries/angular/api.html#angularfire-extending-the-services
}
