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
  if (!_.has(req, 'body')) {
    res.status(400).send('Data missing');
    return;
  }

  mathStuff.insertQuiz(req.body, req.db,
    function successCallback() {
      res.send('Tadaaaa!');
    },
    function errorCallback(error) {
      res.status(400).send(error);
    }
  );
  
  // Make sure the given id's are available in the problemCollection

  // Submit the quiz
});

module.exports = router;