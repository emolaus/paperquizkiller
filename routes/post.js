var express = require('express');
var router = express.Router();
var mathStuff = require('../bin/problem_logic.js');
var _ = require('underscore');
/*
	Receive list of uuids [{id: ...},{id: ...}, ...]
	Return instantiated and html formatted test (no <head>) 
*/
router.post('/preview', function(req, res, next) {
  var data = req.body;
  var testInstance = mathStuff.instantiate(req.db, data.problems, function (instantiatedTest) {
    htmlRenderedTest = res.render('test', {test: instantiatedTest, title: data.title});
  });
});

/*
  Receive list of uuids [{id: ...},{id: ...}, ...]
  Check so that array is not too long.
  Check if each uuid is valid, save to db.
*/
router.post('/createQuiz', function (req, res, next) {
  // Make sure the data is an array of strings
  if (!_.isArray(req.body)) {
    res.status(400).send('Wrong data format');
    return;
  }
  var problems = req.body;

  // Don't let through empty tests
  if (problem.length < 1) {
    res.status(400).send('Test is empty');
  }

  // Don't let through absurdely large tests
  if (problems.length > 100) {
    res.status(400).send('Too many problems in quiz');
    return;
  }

  var allCorrectStrings = true;
  _.each(problems, function (problem) {
    if (!allCorrectStrings) return;

    if (!_.isObject(problem)) allCorrectStrings = false;
    else if (!_.has(problem, 'uuid')) allCorrectStrings = false;
    else if (!_.isString(problem.uuid)) allCorrectStrings = false;
    else if (problem.uuid.length != 24) allCorrectStrings = false;
  });
  if (!allCorrectStrings) {
    res.status(400).send('Error in data.');
    return;
  }

  res.status(200).send('Tadaaa!');
  return;
  // Make sure the given id's are available in the problemCollection

  // Submit the quiz
});

module.exports = router;