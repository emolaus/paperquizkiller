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
        $http.post('/login', {username: $scope.username, password: $scope.password}).then(
          function success(res) {
            $window.location.href = res.data;
          },
          function error(err){
            console.log('error:');
            console.log('error');
          });
      }
    }
    var showInfoMissing = function () {
      $('#infoMissing').show();
    }
    var showFailedLogin = function () {
      $('#infoMissing').hide();
      $('#infoFailedLogin').show();
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