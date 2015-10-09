(function () { 
  var app = angular.module('distributeQuiz', []);

  app.controller('MainController', ['$scope', '$http', '$window', function ($scope, $http, $window){
    $scope.instanceCount = 1;
    $scope.showForm = true;

    $scope.instantiateQuizzes = function () {
      console.log($scope.instanceCount);

      $http.post('/instantiateQuiz', {instanceCount: $scope.instanceCount}).then(
        function successCallback(response) {
          console.log('Success!');
          console.log(response);
          // TODO At this point we have quiz instance info in 
          // response.data: {quizId: uuid, instanceIndex: int}
          // Fetch all quiz instances and populate view
          fetchInstancesAndPopulateView(response.data.quizId, response.data.instanceIndex);
        },
        function errorCallback(response) {
          console.log('error');
          console.log(response);
        }

      );
    }
    var fetchInstancesAndPopulateView = function(quizInstanceUUID, instanceIndex) {
      $http.get('/quizInstances/' + quizInstanceUUID + '/' + instanceIndex).then(
        function successCallback(response) {
          $('.initialForm').hide();
          $('.message').show();
          // Generate html here in angular controller
          var html = "";//headerAndDisclaimer;
          angular.forEach(response.data, function (quizDescription) {
            html += '<div class="row"><div class="span2">' + quizDescription.index + 
                    '</div><div class="span8"><a href="' + quizDescription.url +'">' + quizDescription.url +
                    '</a></div></div>';
          });
          $('#quizList').html(html);
        },
        function errorCallback(response) {
          console.log();
        }
      );
    }
    $scope.goToDashboard = function () {
      $window.location.href = "";
    }
  }]);
})();