module.exports = function(app) {
//Show only active ones
    app.filter('onlyActive', function () {
        return function (items) {
            var result = [];
            angular.forEach(items, function (value, key) {
                if (value.active === true) {
                    result.push(value);
                }
            });
            return result;
        }
    });
}