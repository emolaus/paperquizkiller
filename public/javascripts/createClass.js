(function () {
  var app = angular.module('createClass', []);
  app.controller('MainController', ['$scope', '$http', '$window', function ($scope, $http, $window) {
    $scope.nameOfClass = "";
    $scope.studentList = [];
    $scope.studentNameEntered = function () {
      if (!$scope.newStudentName) return;
      $scope.studentList.push($scope.newStudentName);
      console.log($scope.studentList);
      $scope.newStudentName = ''; 
    }
    $scope.saveClass = function () {
      console.log('Its happeniiiing!! ');
    }
  }]);
})();