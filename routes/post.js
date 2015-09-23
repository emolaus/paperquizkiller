var express = require('express');
var router = express.Router();
var mathStuff = require('../bin/problem_logic.js');
/*
	Receive list of uuids [{id: ...},{id: ...}, ...]
	Return instantiated and html formatted test (no <head>) 
*/
router.post('/preview', function(req, res, next) {
  var uuids = []; // get POST data

  var testInstance = mathStuff.instantiate(req.db, uuids);
  
  res.send('Gotcha');
  // TODO call renderTest()
  // var htmlRenderedTest = renderTest();

  // TODO send result
  //res.send(htmlRenderedTest);
});
module.exports = router;