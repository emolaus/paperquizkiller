(function () { 
  var app = angular.module('createTest', []);
  app.controller('MainController', ['$scope', '$http', '$rootScope',function ($scope, $http, $rootScope){
    $scope.quiz = {};
    $scope.quiz.problems = [];
    $scope.availableProblems = [];
    $scope.quiz.title = 'Arithmetic test 2';

    $scope.preview = function () {
      $http.post('/preview', $scope.quiz).then(
        function successCallback(response) {
          console.log('Success. ' + JSON.stringify(response));
        },
        function errorCallback(response) {
          console.log('Error. ' + response);
        }
      );
    }
    $scope.add = function (text, uuid) {
      $scope.quiz.problems.push({text: text, uuid: uuid});
    }
    var getProblems = function(tag) {
      var appendTag = tag ? "?tag=" + tag : "";
      $http.get("/problems" + appendTag).success(function(response) {
        $scope.availableProblems = response;
        console.log('Data. ' + JSON.stringify(response));
      });
    }

    $scope.search = function () {
      getProblems($scope.tagString);
    }
    getProblems();
    /*$rootScope.$on('rootScope:emit', function (event, data) {
      console.log($rootScope.quiz.problems);
    });*/
  }]);

  app.controller('browseController', ['$scope', '$http', '$rootScope', function ($scope, $http, $rootScope) {
    $scope.tagString = "";
    
    /*var getProblems = function(tag) {
      var appendTag = tag ? "?tag=" + tag : "";
      $http.get("/problems" + appendTag).success(function(response) {
        $scope.problems = response;
      });
    }*/
    /*$scope.search = function () {
      getProblems($scope.tagString);
    }
    /*$scope.add = function (text) {
      $rootScope.quiz.problems.push(text);
      //$rootScope.$emit('rootScope:emit', text);
    }*/
    //getProblems();
    
  }]);
  
  app.controller('testController', ['$scope', '$rootScope', function ($scope, $rootScope) {
    //$rootScope.problems = [];
    $rootScope.$on('rootScope:emit', function (event, data) {
      //$rootScope.problems.push({text: data});
      //$scope.problems = $rootScope.quiz.problems;
    });
  }]);
  
})();
// Format for latex: \(...LaTeX...\)