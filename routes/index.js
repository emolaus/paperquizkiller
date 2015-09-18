var express = require('express');
var router = express.Router();
var mathstuff = require('../bin/problem_logic.js');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/browse', function (req, res) {
    var db = req.db;
    var collection = db.get('problemCollection');
    collection.find({},{}, function (e, problem_set){
        mathstuff.createProblem(problem_set);
        res.render('browse', { 
        problem_list: problem_set, title: 'browse'
      });    
    });
});

router.get('/problems', function(req, res, next) {
  var db = req.db;
  var math = db.get('problemCollection');
  var tag = req.param('tag');
  var query = tag ? {tags: tag}: {};
  var promise = math.find(query, {limit: 10}, function () {});/*(err, doc) {
    if (err) console.log("err: " + err);
    else res.send(doc);
  });*/
  promise.on('error', function (err) {
    console.log("Error getting problems: " + err);
    res.send("");
  });
  promise.on('success', function (docs) {
    res.send(docs);
  });

});


module.exports = router;
