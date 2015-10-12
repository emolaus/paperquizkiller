var express = require('express');
var router = express.Router();
var _ = require('underscore');
var mathstuff = require('../bin/problem_logic.js');
var config = require('../config/serverconfig.js');
var loginstuff = require('../bin/loginstuff.js');

/*
Full page serves.
These two caused some serious headache. Turns out you need absolute paths
in html paths. wrong: "scripts/myscript.js" right: "/scripts/myscript.js"
*/
router.get('/createQuiz', function (req, res) {
  res.sendFile('public/tryit.html', {root: __dirname + "/.."});
});

router.get('/distributeQuiz/:uuid', function (req, res) {
  res.render('distributeQuiz');
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
 * Doesn't make sense to have here.
 */
router.get('/isLoggedIn', function (req, res) {
  if (_.has(req.cookies.user) &&
      _.has(req.cookies.user.username)) {
    res.send(req.cookies.user.username);
    return;
  } else {
    res.send(false);
  }
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

  mathstuff.insertQuiz(req.body, req.db,
    function successCallback(quizUuid) {
      var allTests = [];
      if (req.cookies.allTests) allTests = req.cookies.allTests;
      allTests.push(quizUuid);
      var cookieData = {allTests: allTests, currentTest: quizUuid};
      res.cookie('quizzes', cookieData, {maxAge: config.COOKIE_MAX_AGE});
  
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
  if (!_.has(req.cookies, 'quizzes') ||
      !_.has(req.cookies.quizzes, 'currentTest')) {
    res.status(400).send('No current test in cookie found');
    return;
  }

  // Check so that count is given and valid
  if (!_.has(req, 'body')) {
    res.status(400).send('Data missing');
    return;
  }
  if (!_.has(req.body, 'instanceCount')) {
    res.status(400).send('Data missing');
    return; 
  }
  var quizzesCookie = req.cookies.quizzes;
  mathstuff.instantiateQuiz(
    quizzesCookie.currentTest,
    req.body.instanceCount,
    req.db,
    function successCallback(data) {
      quizzesCookie.instanceIndex = data.instanceIndex;
      res.cookie('quizzes', quizzesCookie, {maxAge: 1000*3600*24*31});
      res.send(data);
    },
    function errorCallback(error) {
      res.status(400).send('Error instantiating tests: ' + error);
    }
  );
});

router.post('/login', function (req, res) {
  if(!req.body || 
     !_.has(req.body, 'username') || !_.isString(req.body.username) ||
     !_.has(req.body, 'password' || !_.isString(req.body.password))
     ) {
    console.log('Error at POST /login. Incorrect data in body. ');
    res.status(400).send('data missing');
    return;
  }
  loginstuff.loginLight(
      req.db,
      req.body.username,
      req.body.password,
      function (err, success) {
        if (err) {
          res.status(400).send(err);
        } else if (success) {
          // set cookie
          var userCookie = {username: req.body.username};
          res.cookie('user', userCookie, {maxAge: config.COOKIE_MAX_AGE});
          res.send(true);
        } else {
          res.status(400).send('Failed without error message');
        }
      }
    );
});

module.exports = router;