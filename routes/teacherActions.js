var express = require('express');
var router = express.Router();
var _ = require('underscore');
var mathstuff = require('../bin/problem_logic.js');
var config = require('../config/serverconfig.js');

/*
Full page serves.
These two caused some serious headache. Turns out you need absolute paths
in html paths. wrong: "scripts/myscript.js" right: "/scripts/myscript.js"
*/
router.get('/createQuiz', function (req, res) {
  res.sendFile('public/tryit.html', {root: __dirname + "/.."});
});

router.get('/distributeQuiz/:uuid', function (req, res) {
  // validate uuid
  mathstuff.verifyQuizExists(
    req.params.uuid, 
    req.db, 
    function success() {
      res.render('distributeQuiz', {quizUuid: req.params.uuid, username: req.cookies.user.username});
    }, 
    function error() {
      console.log('GET /distribute quiz. Received invalid quiz uuid ' + req.params.uuid);
      res.status(400).send('Quiz id not found.');
    });
});

/**
 * If the username doesn't match the logged in user, returns with status code 401
 */
router.get('/dashboard/:username', function (req, res) {
  // check so that this is the correct user.
  if (req.cookies.user.username != req.params.username) {
    res.status(401).send('Username not matching your login credentials');
    return;
  }
  mathstuff.getAllQuizzesRelatedToUser(
    req.db, 
    req.cookies.user.userUuid,
    function (err, docs) {
      if (err) {
        res.status(400).send(err);
        return;
      }
      res.render('dashboard', {quizData: docs, username: req.params.username});
    });
});
/*
  Turns out you can't inject more than simple variables with angular ng-init
  So the client must fetch the data from here at (/dashboard/username)
*/
router.get('/getAllQuizzesRelatedToUser/:username', function (req, res) {
if (req.cookies.user.username != req.params.username) {
    res.status(401).send('Username not matching your login credentials');
    return;
  }
  mathstuff.getAllQuizzesRelatedToUser(
    req.db, 
    req.cookies.user.userUuid,
    function (err, docs) {
      if (err) {
        res.status(400).send(err);
        return;
      }
      res.send(docs);
    });
});

/**
 * Partial content serve. Get list of quiz instances with index and url
 *
 */
router.get('/quizInstances/:uuid/:instanceIndex', function (req, res) {
  // Fetch all data except problem list from db
  mathstuff.getAllQuizInstances(
    req.params.uuid, 
    req.params.instanceIndex, 
    req.db,
    function successCallback(quizInstances) {
      // A bunch of data arrived. Clean and send necessary data.
      var host = req.get('host');
      var response = _.map(quizInstances, function (quizInstance) {
        return {
          index: quizInstance.index,
          url: host + '/quiz/' + quizInstance._id
        }
      }); 

      res.send(response);
    },
    function errorCallback(error) {
      console.log('/quizInstances/:uuid/:instanceIndex - failed fetching quiz instances.' );
      res.status(400).send(error);
    });
});

router.get('/quizReportSummary/:quizUuid/:instanceIndex', function (req, res) {

  // TODO
  mathstuff.getQuizResultSummary(
    req.db, 
    req.params.quizUuid, 
    parseInt(req.params.instanceIndex), 
    function (error, data) {
      if (error) res.status(400).send('Error. Possibly bad quiz id or instance index.');
      else {
        var formatted = [['Problem', 'Submitted', 'Correct']];
        _.each(data, function (problemRow, index) {
          formatted.push(problemRow);
        });
        res.send(formatted);
      }
  }); 
});
/**
 * Receive list of uuids [{id: ...},{id: ...}, ...]
 * Return instantiated and html formatted test (no <head>) 
 */
router.post('/preview', function(req, res, next) {
  var data = req.body;
  var testInstance = mathstuff.instantiate(
    req.db, 
    data.problems, 
    function (instantiatedTest) {
      res.render('test', {test: instantiatedTest, title: data.title});
    },
    function error(error) {
      res.status(400).send('error in preview: ' + error);
    });
});

/*
  Receive list of uuids [{id: ...},{id: ...}, ...]
  Check so that array is not too long.
  Check if each uuid is valid, save to db.
*/
router.post('/createQuiz', function (req, res) {
  if (!_.has(req, 'body')) {
    res.status(400).send('Data missing');
    return;
  }
  console.log(req.body);
  mathstuff.insertQuiz(
    req.body, 
    req.db,
    req.cookies.user.userUuid,
    function successCallback(quizUuid) {
      //var allTests = [];
      //if (req.cookies.allTests) allTests = req.cookies.allTests;
      //allTests.push(quizUuid);
      //var cookieData = {allTests: allTests, currentTest: quizUuid};
      //res.cookie('quizzes', cookieData, {maxAge: config.COOKIE_MAX_AGE});
  
      res.send(quizUuid);
    },
    function errorCallback(error) {
      res.status(400).send(error);
    }
  );
});
/**
 * Expects two post data elements: 
 {
    instanceCount [integer]
    quizUuid [string]

    On success, returns {success: true, quizId: uuid, instanceIndex: instanceIndex}
    On error, sets HTTP status code to 400 and returns error message
 }
 */
router.post('/instantiateQuiz', function (req, res) {

  // Check so that count is given and valid
  if (!_.has(req, 'body')) {
    res.status(400).send('Data missing');
    return;
  }
  if (!_.has(req.body, 'instanceCount')) {
    res.status(400).send('Data missing');
    return; 
  }
  if (!_.has(req.body, 'quizUuid')) {
    res.status(400).send('Data missing');
    return; 
  }


  //var quizzesCookie = req.cookies.quizzes;
  mathstuff.instantiateQuiz(
    req.body.quizUuid,
    req.body.instanceCount,
    req.cookies.user.userUuid,
    req.db,
    function successCallback(data) {
      //quizzesCookie.instanceIndex = data.instanceIndex;
      //res.cookie('quizzes', quizzesCookie, {maxAge: 1000*3600*24*31});
      res.send(data);
    },
    function errorCallback(error) {
      res.status(400).send('Error instantiating tests: ' + error);
    }
  );
});

module.exports = router;