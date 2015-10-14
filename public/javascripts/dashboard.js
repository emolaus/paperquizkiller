(function () {
  var app = angular.module('dashboard', []);
  app.controller('MainController', ['$scope', '$http', '$window', function ($scope, $http, $window){
    $scope.quizData = [];
    // Terrible workaroud to get exact same data to client as what generated the page...
    (function fetchQuizInfo() {
      $http.get('/getAllQuizzesRelatedToUser/' + $scope.username).then(
        function success(result) {
          console.log(result)
          $scope.quizData = result.data;
        }, 
        function error() {
          console.log('failed fetching quiz data');
        });
    })();
    $scope.distribute = function(quizUuid) {
      $window.location.href = '/distributeQuiz/' + quizUuid;
    };
    $scope.createNewQuiz = function () {
      $window.location.href = '/createQuiz';
    };
    $scope.viewQuizInstanceDetails = function(quizIndex, instanceIndex) {
      console.log('TODO create quiz detail page.');
    };
  }]);
})();