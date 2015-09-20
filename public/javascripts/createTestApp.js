(function () { 
  var app = angular.module('createTest', []);
  app.controller('browseController', ['$scope', '$http', function ($scope, $http) {
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
     getProblems();
  }]);
  
})();
