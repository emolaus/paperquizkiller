(function () { 
  var app = angular.module('quizInstance', []);
  app.controller('MainController', ['$scope', '$http','$window',function ($scope, $http, $window){
    $scope.answers = new Array($scope.problemCount);
    $scope.submit = function () {
      var postData = {
        answers: $scope.answers,
        uuid: $scope.uuid
      };
      $http.post('/submitQuiz', postData).then(
        function success(response) {
          console.log('Success!');
          console.log(response);
        },
        function error(response) {
          console.log('Error!');
          console.log(response);
        });
    }
  }]);

})();