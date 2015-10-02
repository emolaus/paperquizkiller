var express = require('express');
var router = express.Router();
var mathstuff = require('../bin/problem_logic.js');
var _ = require('underscore');

router.get('/createQuiz', function (req, res) {
  res.sendFile('public/tryit.html', {root: __dirname + "/.."});
});
router.get('/distributeQuiz/:uuid', function (req, res) {
  //console.log('dirname: ' + __dirname); // Outputs /home/mattiasolausson/NodeWorkspace/nodetest1/routes
  //console.log(req.params);
  res.render('distributeQuiz');
  //res.sendFile('public/distributeQuiz.html', {root: __dirname + "/.."});
});
/*
router.get('/distributeQuiz/:uuid', function (req, res) {
  console.log('dirname: ' + __dirname);
  res.sendFile('public/distributeQuiz.html', {root: __dirname + "/.."});
});*/
/*
This serves a html formatted quiz to the student.
*/
router.get('/quiz/:uuid', function (req, res, next) {
  mathstuff.getQuizInstance(
    req.params.uuid, 
    req.db, 
    function successCallback(quizInstance) {
      res.render('quizInstance', {test: quizInstance.problems, title: quizInstance.title});
    }, 
    function errorCallback (error) {
      next();
    });
});

router.get('/quizInstances/:uuid/:instanceIndex', function (req, res) {
  // Fetch all data except problem list from db
  mathstuff.getAllQuizInstances(
    req.params.uuid, 
    req.params.instanceIndex, 
    req.db,
    function successCallback(quizInstances) {
      // A bunch of data arrived. Clean and send necessary data.
      var host = req.get('host');
      var response = _.map(quizInstances, function (quizInstance) {
        return {
          index: quizInstance.index,
          url: host + '/quiz/' + quizInstance._id
        }
      }); 

      res.send(response);
    },
    function errorCallback(error) {
      console.log('/quizInstances/:uuid/:instanceIndex - failed fetching quiz instances.' );
      res.status(400).send(error);
    });
});

// OBS kan använda /problems?tag1=lala&tag2=kaka
// och req.query
router.get('/problems/:tag1?/:tag2?/:tag3?/:tag4?/:tag5?/:tag6?', function(req, res, next) {
  var db = req.db;
  var math = db.get('problemCollection');
  var query = makeQuery(req.params);
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

/*
  Build a mongo query from an object of tags: {tag1: "...", tag2: ... tag6: "..."}
  With multiple tags given, the query should be an AND operation
  to narrow down search results.
*/
function makeQuery(tags) {
  // No tags?
  if (_.isUndefined(tags.tag1)) 
    return {};
  
  // One tag?
  if (_.isUndefined(tags.tag2)) 
    return { tags: {$in: [tags.tag1]}};
  
  var query = {$and: []};
  
  _.each(tags, function (value) {
    if (!value) return;
    query.$and.push({tags: {$in: [value]}});
  });
  console.log(query);
  return query;

}

module.exports = router;
