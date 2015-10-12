var express = require('express');
var router = express.Router();
var mathstuff = require('../bin/problem_logic.js');
var loginstuff = require('../bin/loginstuff.js');
var _ = require('underscore');
var config = require('../config/serverconfig.js');
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
/*
post data need to be an object with elements 
 - quizId, a quizInstance iD
 - answers, an array with solutions
*/
router.post('/submitQuiz', function (req, res){
  if(!req.body || 
     !_.has(req.body, 'answers') || !_.isArray(req.body.answers) ||
     !_.has(req.body, 'uuid')
     ) {
    console.log('Error at POST /submitQuiz. Incorrect data in body. ');
    res.status(400).send('data missing');
    return;
  }
  mathstuff.submitQuiz(
    req.body.uuid,
    req.body.answers,
    req.db, 
    function success(result) {
      res.send();
    },
    function error(error) {
      console.error(error);
      res.status(400).send(error);
    });  
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
// TODO POST /register

module.exports = router;