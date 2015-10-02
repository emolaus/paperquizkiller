var express = require('express');
var router = express.Router();

router.get('/:uuid', function (req, res) {
  console.log('dirname: ' + __dirname); // Outputs /home/mattiasolausson/NodeWorkspace/nodetest1/routes
  console.log(req.params);
  res.sendFile('public/distributeQuiz.html', {root: __dirname + "/.."});
});

module.exports = router;