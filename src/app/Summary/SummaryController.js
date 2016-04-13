app.controller('SummaryController', function($scope, $state, $stateParams, FireRef, $firebaseArray) {

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

    $scope.downloadPDF = function() {
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

        // I know, a pretty uggly for loop
        for (i = 3; i < $scope.cart.length+3; i++) {
            doc.text(20, 10*i, $scope.cart[i-3].categoryTitle + ' - '+ $scope.cart[i-3].title + ' Pris: ' + $scope.cart[i-3].price + ':-');
        }

        // Saving pdf
        doc.save('Sammanfattning.pdf');
    };

});