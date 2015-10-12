(function () { 
  var app = angular.module('createTest', []);
  app.controller('MainController', ['$scope', '$http', '$rootScope','$window', function ($scope, $http, $rootScope, $window){
    $scope.quiz = {};
    $scope.quiz.problems = [];
    $scope.availableProblems = [];
    $scope.quiz.title = 'Title';
    $scope.tagString = "";

    $scope.add = function (text, uuid) {
      $scope.quiz.problems.push({text: text, uuid: uuid});
    }
    var getProblems = function(tagString) {
      var appendTag = "";
      console.log(tagString)
      if (tagString) {
        tags = tagString.match(/("[^"]+"|[^;,"\s]+)/g);
        // Send maximally 6 search words
        if (tags.length > 6) tags = tags.slice(0,6);
        appendTag = tags.join("/");
      }

      $http.get("api/problems/" + appendTag).success(function(response) {
        $scope.availableProblems = response;
      });
    }

    $scope.search = function () {
      getProblems($scope.tagString);
    }
    // Get some problems
    getProblems("");

    // Button click "done"
    $scope.done = function () {
      // TODO call API createTest
      // What if quiz already exists? Update not create.
      $http.post('createQuiz', $scope.quiz).then(
        function successCallback(response) {
          $window.location.href = '/distributeQuiz/' + response.data;
        },
        function errorCallback(response) {
          console.log(response);
        }

      );
    }
    $scope.preview = function () {
      // THis next line isn't great, would prefer two-way binding
      $scope.quiz.title = $('#testHeading').html();
      $http.post('/preview', $scope.quiz).then(
        function successCallback(response) {

          $('#modalPreviewBody').html(response.data); 
          MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
          $('#modalPreview').modal('show');
        },
        function errorCallback(response) {
          
          console.log('Error. ' + JSON.stringify(response));
        
        }
      );
    }
    $scope.submit = function () {
      console.log("Clicked submit");
    }
  }]);

  app.controller('browseController', ['$scope', '$http', '$rootScope', function ($scope, $http, $rootScope) {
    //$scope.tagString = "";
    
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