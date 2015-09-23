var express = require('express');
var router = express.Router();

/*
	Receive list of uuids [{id: ...},{id: ...}, ...]
	Return instantiated and html formatted test (no <head>) 
*/
router.post('/preview', function(req, res, next) {
  // TODO call instantiate()
  // TODO call renderTest()
  // TODO send result
});
module.exports = router;