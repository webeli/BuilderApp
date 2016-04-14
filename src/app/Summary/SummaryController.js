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

            // Generate new jsPDF document
            var doc = new jsPDF();

            // Title
            doc.setFontSize(20);
            doc.setFontType("bold");
            doc.text(20, 20, 'Sammanfattning');

            // Generating all elements
            doc.setFontSize(14);
            doc.setFontType("normal");

            var marginTop = 20;
            for (i = 0; i < $scope.cart.length; i++) {
                marginTop += 10;
                doc.text(20, marginTop, $scope.cart[i].categoryTitle + ' - ' + $scope.cart[i].title + ' Pris: ' + $scope.cart[i].price + ':-');
            }

            // Saving pdf
            doc.save('Sammanfattning.pdf');
        };

    });
}