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
      res.render('distributeQuiz', {quizUuid: req.params.uuid});
    }, 
    function error() {
      console.log('GET /distribute quiz. Received invalid quiz uuid ' + req.params.uuid);
      res.status(400).send('Quiz id not found.');
    });
});

router.get('dashboard/:username', function (req, res) {
  mathstuff.getAllQuizzesOfUser(
    req.db, 
    req.params.username,
    function (err, doc) {
      // TODO
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

router.post('/instantiateQuiz', function (req, res) {
  // Here comes the big question. Use cookie data or post data?
  // For now, use cookies.quizzes.currentTest (uuid)
  // check that currentTest is set
  /*if (!_.has(req.cookies, 'quizzes') ||
      !_.has(req.cookies.quizzes, 'currentTest')) {
    res.status(400).send('No current test in cookie found');
    return;
  }*/

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