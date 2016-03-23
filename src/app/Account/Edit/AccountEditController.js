app.controller('AccountEditController', function($scope, FireRef, $stateParams, $firebaseObject) {
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

    var keys = $firebaseObject(FireRef.child(projectKey).child("categories"));
    console.log(keys);
    $scope.keys = keys;

});