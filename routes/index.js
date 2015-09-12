var express = require('express');
var router = express.Router();
var mathstuff = require('../bin/problem_logic.js');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET hello world */
router.get('/helloworld', function (req, res) {
    res.render('helloworld', {title: 'Hello, world!'});
});

router.get('/browse', function (req, res) {
    var db = req.db;
    var collection = db.get('problem_collection');
    collection.find({},{}, function (e, problem_set){
        mathstuff.createProblem(problem_set);
        console.log(problem_set)
        res.render('browse', { 
        problem_list: problem_set, title: 'browse'
      });    
    });
});


module.exports = router;
