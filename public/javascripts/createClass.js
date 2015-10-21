(function () {
  var app = angular.module('createClass', []);
  app.controller('MainController', ['$scope', '$http', '$window', function ($scope, $http, $window) {
    $scope.nameOfClass = '';
    $scope.studentList = [];
    $scope.infoText = 'Kaka'
    $scope.studentNameEntered = function () {
      if (!$scope.newStudentName) return;
      if ($scope.studentList.length == 0) {
        $scope.infoText = "You need to add at least one student.";
        $('#modalInfo').modal('show');
        return;
      }
      if ($scope.studentList.length >= 5) {
        $scope.infoText = "You've reached the maximum nr of students in one class.";
        $('#modalInfo').modal('show');
        return;
      }
      $scope.studentList.push($scope.newStudentName);
      $scope.newStudentName = ''; 
    }
    $scope.saveClass = function () {
      if (!$scope.nameOfClass) {
        $scope.infoText = 'Please select a name for this class.';
        $('#modalInfo').modal('show');
        return;
      }
      console.log($scope.username)
      $http.post('/addClass/' + $scope.username).then(
        function success(result) {
          console.log('Great success!');
        },
        function error(error) {
          console.log(error);
        });
    }
  }]);
})();