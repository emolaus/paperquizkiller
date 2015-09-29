var express = require('express');
var router = express.Router();
var mathstuff = require('../bin/problem_logic.js');
var _ = require('underscore');
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

router.get('/problems/:tag1?/:tag2?/:tag3?/:tag4?/:tag5?/:tag6?', function(req, res, next) {
  var db = req.db;
  var math = db.get('problemCollection');
  var query = makeQuery(req.params);
  console.log(JSON.stringify(query));
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

function makeQuery(tags) {
  var query = {};
  if (_.isUndefined(tags.tag1)) return query;

  query.tags = {$in: []};
  
  _.each(tags, function (value) {
    if (!value) return;
    query.tags.$in.push(value);
  });
  return query;

}
module.exports = router;
