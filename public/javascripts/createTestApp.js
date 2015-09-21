(function () { 
  var app = angular.module('createTest', []);
  app.controller('browseController', ['$scope', '$http', '$rootScope', function ($scope, $http, $rootScope) {
    $scope.tagString = "";
    
    var getProblems = function(tag) {
      var appendTag = tag ? "?tag=" + tag : "";
      $http.get("/problems" + appendTag).success(function(response) {
        $scope.problems = response;
      });
    }
    $scope.search = function () {
      getProblems($scope.tagString);
    }
    $scope.add = function (text) {
      $rootScope.$emit('rootScope:emit', text);
    }
    getProblems();
    
  }]);
  app.controller('testController', ['$scope', '$rootScope', function ($scope, $rootScope) {
    $scope.problems = [];
    $rootScope.$on('rootScope:emit', function (event, data) {
      $scope.problems.push({text: data});
    });
  }]);
  
})();
// Format for latex: \(...LaTeX...\)