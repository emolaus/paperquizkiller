(function () { 
  var app = angular.module('distributeQuiz', []);

  app.controller('MainController', ['$scope', '$http', function ($scope, $http){
    $scope.instanceCount = 1;
    $scope.instantiateQuizzes = function () {
      console.log($scope.instanceCount);

      $http.post('/instantiateQuiz', {instanceCount: $scope.instanceCount}).then(
        function successCallback(response) {
          console.log('Success!');
          console.log(response);
        },
        function errorCallback(response) {
          console.log('error');
          console.log(response);
        }

      );
    }
  }]);
})();