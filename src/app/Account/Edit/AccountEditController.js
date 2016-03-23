app.controller('AccountEditController', function($scope, FireRef, $stateParams, $firebaseArray, $uibModal) {
    console.log("AccountEditController");
    var projectKey = $stateParams.projectKey;

    $scope.editSave = function(data) {
        console.log(data);
        var projectRef = FireRef.child(projectKey).child("categories");
        projectRef.push({
            category: data.category,
            value: data.value
        });

        //projectRef.set({test: data});
        //projectRef.push({test: data});
    }

    //kommentar
    $scope.saveCategory = function() {
        //
    }

    $scope.debug = function(data) {
        debugger;
    }

    $scope.selectCategory = function(data) {
        $scope.selected = data;
        //var modalInstance = $uibModal.open({templateUrl: 'myModalContent.html'});

    }

    $scope.test = function () {
        var modalInstance = $uibModal.open({templateUrl: 'myModalContent.html', controller: 'AccountEditController'});
    }

    var categories = $firebaseArray(FireRef.child(projectKey).child("categories"));

    $scope.categories = categories;


});