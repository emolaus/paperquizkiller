var express = require('express');
var router = express.Router();
var mathstuff = require('../bin/problem_logic.js');
var _ = require('underscore');

/*
This serves a html formatted quiz to the student.
*/
router.get('/quiz/:uuid', function (req, res, next) {
  mathstuff.getQuizInstance(
    req.params.uuid, 
    req.db, 
    function successCallback(quizInstance) {
      // if submitted, show result page
      // if not, show quiz page
      if (quizInstance.submitted) {
        res.render('quizResult', {
          quiz: quizInstance
        });
      }
      else {
        res.render('quizInstance', {
          test: quizInstance.problems, 
          title: quizInstance.title, 
          problemCount: quizInstance.problems.length,
          uuid: req.params.uuid
        });
      }
    }, 
    function errorCallback (error) {
      next();
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
