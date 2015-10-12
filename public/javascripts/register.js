(function () { 
  var app = angular.module('register', []);

  app.controller('MainController', ['$scope', '$http', '$window', function ($scope, $http, $window){
    $scope.username = "";
    $scope.password = "";
    $scope.loginOrRegister = "register";
    $scope.go = function () {
      if (!$scope.username || !$scope.password) {
        showInfoMissing();
        return;
      }
      if ($scope.loginOrRegister == 'register') {
        // TODO register user
      } else {
        // TODO login user
      }
    }
    var showInfoMissing = function () {
      $('#infoMissing').show();
    }
    $scope.$watch('loginOrRegister', function (action) {
      if (action === 'register') {
        $scope.loginOrRegister = 'register';
        $('#loginHeader').hide();
        $('#registerHeader').show();
      } else if (action === 'login') {
        $scope.loginOrRegister = 'login';
        $('#loginHeader').show();
        $('#registerHeader').hide();
      }
    });
  }]);
})();