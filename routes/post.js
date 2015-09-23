var express = require('express');
var router = express.Router();

/*
	Receive list of uuids [{id: ...},{id: ...}, ...]
	Return instantiated and html formatted test (no <head>) 
*/
router.post('/preview', function(req, res, next) {
  var uuids = []; // get POST data
  
  // TODO call instantiate() (not implemented)
  // var testInstance = instantiate();
  
  // TODO call renderTest()
  // var htmlRenderedTest = renderTest();

  // TODO send result
  //res.send(htmlRenderedTest);
});
module.exports = router;