module.exports = function(app) {
    app.controller('SummaryController', ['$scope', '$state', '$stateParams', 'FireRef', '$firebaseArray', '$firebaseObject', 'htmlHelper', '$filter', '$http', function ($scope, $state, $stateParams, FireRef, $firebaseArray, $firebaseObject, htmlHelper, $filter, $http) {

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

        $scope.sendEmail = function() {
            console.log("Send...");
            var customerData = $scope.customer;
            var url = 'https://builderappmail.herokuapp.com/';

            $http({
                method: 'POST',
                url: 'https://builderappmail.herokuapp.com/',
                data: customerData
            }).then(function successCallback(response) {
                // this callback will be called asynchronously
                // when the response is available
                console.log("success:", response);
            }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                console.log("failure:", response);
            });

            //$http.post('http://builderappmail.herokuapp.com/', data).then(successCallback, errorCallback);

        };

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



    }]);
}