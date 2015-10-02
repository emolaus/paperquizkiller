var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
  console.log('dirname: ' + __dirname); // Outputs /home/mattiasolausson/NodeWorkspace/nodetest1/routes
  console.log(req.params);
  res.render('distributeQuiz');
  //res.sendFile('public/distributeQuiz.html', {root: __dirname + "/.."});
});

module.exports = router;