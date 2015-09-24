var express = require('express');
var router = express.Router();
var mathStuff = require('../bin/problem_logic.js');
/*
	Receive list of uuids [{id: ...},{id: ...}, ...]
	Return instantiated and html formatted test (no <head>) 
*/
router.post('/preview', function(req, res, next) {
  var uuids = [{uuid: '55fc65a49fb3decb243d90ee'}, {uuid: '55fc65a49fb3decb243d90ef'}]; // get POST data

  var testInstance = mathStuff.instantiate(req.db, uuids, function (instantiatedTest) {
  	htmlRenderedTest = res.render('test', {test: instantiatedTest});
  });
});
module.exports = router;