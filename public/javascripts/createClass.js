(function () {
  var app = angular.module('createClass', []);
  app.controller('MainController', ['$scope', '$http', '$window', function ($scope, $http, $window) {
    $scope.nameOfClass = '';
    $scope.studentList = [];
    $scope.infoText = 'Kaka'
    $scope.studentNameEntered = function () {
      if (!$scope.newStudentName) return;
      if ($scope.studentList.length >= 5) {
        $scope.infoText = "You've reached the maximum nr of students in one class.";
        $('#modalInfo').modal('show');
        return;
      }
      if ($scope.studentList.indexOf($scope.newStudentName) > -1) {
        $scope.infoText = "Your student names must be unique. Perhaps add a nickname, lastname or initial.";
        $('#modalInfo').modal('show');
        return;
      }
      $scope.studentList.push($scope.newStudentName);
      $scope.newStudentName = ''; 
    }
    $scope.saveClass = function () {
      if ($scope.studentList.length == 0) {
        $scope.infoText = "You need to add at least one student.";
        $('#modalInfo').modal('show');
        return;
      }
      if (!$scope.nameOfClass) {
        $scope.infoText = 'Please select a name for this class.';
        $('#modalInfo').modal('show');
        return;
      }
      console.log($scope.username)
      $http.post('/addClass/' + $scope.username, {nameOfClass: $scope.nameOfClass, studentList: $scope.studentList}).then(
        function success(result) {
          $window.location.href = '/dashboard/' + $scope.username;
        },
        function error(error) {
          $scope.infoText = errors;
        $('#modalInfo').modal('show');
        });
    }
  }]);
})();