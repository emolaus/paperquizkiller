var express = require('express');
var router = express.Router();
var mathStuff = require('../bin/problem_logic.js');
/*
	Receive list of uuids [{id: ...},{id: ...}, ...]
	Return instantiated and html formatted test (no <head>) 
*/
router.post('/preview', function(req, res, next) {
  var uuids = [{uuid: '55fc65a49fb3decb243d90ee'}, {uuid: '55fc65a49fb3decb243d90ef'}]; // get POST data
  var data = req.body;
  console.log(JSON.stringify(data));
  var testInstance = mathStuff.instantiate(req.db, data.problems, function (instantiatedTest) {
    console.log(JSON.stringify(instantiatedTest));
  	htmlRenderedTest = res.render('test', {test: instantiatedTest});
  });
});
module.exports = router;