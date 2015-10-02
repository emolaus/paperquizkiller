(function () { 
  var app = angular.module('createTest', []);
  app.controller('MainController', ['$scope', '$http','$window',function ($scope, $http, $window){
    $scope.quiz = {};
    $scope.quiz.problems = [];
    $scope.submit = function () {
      console.log("HERE");
    }
  }]);

})();