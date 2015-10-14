(function () {
  var app = angular.module('dashboard', []);
  app.controller('MainController', ['$scope', '$http', '$window', function ($scope, $http, $window){
    $scope.quizData = [];
    // This will contain info if each chart_divX_Y is rendered. Ex. {chart_div1_0: true}
    $scope.isChartRendered = {};
    // Terrible workaroud to get exact same data to client as what generated the page...
    (function fetchQuizInfo() {
      $http.get('/getAllQuizzesRelatedToUser/' + $scope.username).then(
        function success(result) {
          console.log(result)
          $scope.quizData = result.data;
        }, 
        function error() {
          console.log('failed fetching quiz data');
        });
    })();
    $scope.distribute = function(quizUuid) {
      $window.location.href = '/distributeQuiz/' + quizUuid;
    };
    $scope.createNewQuiz = function () {
      $window.location.href = '/createQuiz';
    };
    $scope.viewQuizInstanceDetails = function(quizIndex, instanceIndex) {
      console.log('TODO create quiz detail page.');
    };
    $scope.showDetails = function(quizIndex, instanceIndex) {
      var divId = 'chart_div' + quizIndex + '_' + instanceIndex;
      var chartDiv = $('#' + divId);
      // TODO fetch data

      // Prpboem
      if (chartDiv.is(':hidden')) {
        chartDiv.show();
        if (!$scope.isChartRendered[divId]) {
          // assemble data
          // Vilken data behövs? -Antalet problem, antalet submitted för varje problem, antalet correct för varje problem
          data = [];
          $http.get('/getDetailedQuizReport/' + quizIndex + '/' + instanceIndex).then(function success(result) {
            // Parse data
            renderChart(divId, data); 
          }, 
          function error(result) {
            console.log('Error fetching detailed data');
            console.log(result.data);
          });

        }
        });
      }
      else chartDiv.hide('slow');
    }
    function renderChart(divId, data) {
      // Create the data table.
      $scope.isChartRendered[divId] = true;
      var data = google.visualization.arrayToDataTable([
        ['Problem', 'Submitted', 'Correct'],
        ['1', 1000, 400],
        ['2', 1170, 460],
        ['3', 660, 1120],
        ['4', 1030, 540]
      ]);


      // Set chart options
      var options = {
        chart: {
          'title':'',
          'width':400,
          'height':150 
          },
        bar: 'vertical'
        }

      // Instantiate and draw our chart, passing in some options.
      var chart = new google.charts.Bar(document.getElementById(divId));
      chart.draw(data, options);
    }
  }]);
})();