var express = require('express');
var router = express.Router();
var mathstuff = require('../bin/problem_logic.js');

var _ = require('underscore');
/*
	Receive list of uuids [{id: ...},{id: ...}, ...]
	Return instantiated and html formatted test (no <head>) 
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
      res.cookie('quizzes', cookieData, {maxAge: 1000*3600*24*31});
  
      res.send('success');
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

  mathstuff.instantiateQuiz(
    req.cookies.quizzes.currentTest,
    req.body.instanceCount,
    req.db,
    function successCallback(data) {
      res.send(data);
    },
    function errorCallback(error) {
      res.status(400).send('Error instantiating tests: ' + error);
    }
  );
});

module.exports = router;