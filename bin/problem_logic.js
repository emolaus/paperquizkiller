var mathjs = require('mathjs');
var _ = require('underscore');
var async = require('async');
var config = require('../config/serverconfig.js');
var mathstuff = {};

mathstuff.createProblem = function(problem_set, seed) {
  if (!seed) seed = 0;
  // if problem_set is array, iterate
  // else it's just one, pass that
  if (Array.isArray(problem_set)) {
    // TODO step seed
    // Do not use for(in), creates local copy
    for (var i = 0; i < problem_set.length; i++) {
      setOne(problem_set[i]);
      //problem_set[i].seed = seed;
    }
  } else {
    setOne(problem, seed);
    //problem_set.seed = seed;
  }

}
function setOne(problem, seed) {
  // for each parameter
    // while "_" + parameter found in problem text
    // replace "_" + parameter with randomized value
  var instantiatedProblem = {};
  instantiatedProblem.problemId = problem._id;
  var newText = problem.text;
  for (var param in problem.parameters){
    if (problem.parameters.hasOwnProperty(param)) {
        paramObj = problem.parameters[param];
        var setVal = setParameter(paramObj, seed);
        //problem.parameters[param].instantiated = setVal;
        while (newText.search("_" + param) > -1) {
          newText = newText.replace("_" + param, setVal);
        }
    }
  }
  instantiatedProblem.text = newText;  
  return instantiatedProblem;
}

function setParameter(paramObj, seed) {
  
  // TODO
  // If array, this is a set
  if (Array.isArray(paramObj.set)) {
    return mathjs.pickRandom(paramObj.set);
  }
  return 1;
   
  // TODO if object, parse
}
/**
Pass two arguments: a db handle (pointing at right database 'math') and either 
- an array of problems (uuid's: {uuid: "..."}) or
- Not implemented: Pass uuid of testtemplate

Returns a complete test, i.e. an array of instantiated problems
*/
mathstuff.instantiate = function (db, arg2, callback) {
  // array passed?
  if (_.isObject(db) && _.isArray(arg2)) {
    return instantiateFromProblemUUIDs(db, arg2, callback);
  }
  // TODO instantiate from testtemplate uuid
  else if (_.isObject(db) && _.isString(arg2))
  {
      // TODO
      return [];
  }
  return false;
}
function instantiateFromProblemUUIDs(db, uuids, finalCallback) {
  var instantiatedTest = [];
  var collection = db.get('problemCollection');
  async.eachSeries(
    uuids, 
    function iterator(item, callback) {
      collection.findById(item.uuid, function (error, problem) {
        if (error) {
          console.log('instantiate(): error: ' + error);
          callback(error);
        } else {
          var instantiatedProblem = setOne(problem);
          instantiatedTest.push(instantiatedProblem);
          callback(null);
        }
      });
  },function done() {
    finalCallback(instantiatedTest);
  });
}
/*
  Expects a quiz object: 
  {
    (optional) title: string (possibly empty)
    problems: [
      {uuid: ...},
      ...
    ]
  }
*/
/*
  Expects a quiz object (see verifyQuiz()) and a db handle.
  errorCallback(error): error is an error message as a string
*/
mathstuff.insertQuiz = function (quiz, db, successCallback, errorCallback) {
  mathstuff.verifyQuiz(quiz, db,
    function () {
      // At this point we have a valid quiz object. Time to insert into db.
      // Question: perhaps better to flatten problem array to array of id's?
      // Would make find() easier
      var flattenedProblems = [];
      _.each(quiz.problems, function (problem) {
        flattenedProblems.push(problem.uuid);
      });
      var newQuiz = {
        title: quiz.title, 
        problems: flattenedProblems,
        insertionDate: new Date()
      };
      var collection = db.get('quizCollection');
      collection.insert(newQuiz, function (err, doc) {
        if (err) errorCallback('Failed inserting quiz');
        else { 
          console.log('Successfully inserted quiz:');
          console.log(JSON.stringify(doc));
          successCallback();
        }
      });
    },
    errorCallback);
}
mathstuff.verifyQuiz = function (quiz, db, successCallback, errorCallback) {
  if (!_.isObject(quiz)) {
    errorCallback('Expected quiz to be object');
    return;
  }
  if (_.has(quiz, 'title') && 
      _.isString(quiz.title) &&
      (quiz.title.length > config.MAX_TITLE_LENGTH)) {
    errorCallback('Quiz title too long.');
    return;
  }
  if (!_.has(quiz, 'problems')) {
    errorCallback('Missing quiz.problems element');
    return;
  }
  mathstuff.verifyQuizProblems(quiz.problems, db, function (error) {
    if (!error) successCallback();
    else errorCallback(error);
    return;
  });
}
mathstuff.verifyQuizProblems = function(problems, db, callback) {
// Make sure the data is an array of strings
  if (!_.isArray(problems)) {
    callback('Expected problems to be array');
    return;
  }

  // Don't allow empty tests
  if (problems.length < 1) {
    callback('Expected problems to have at least one element');
    return;
  }

  // Don't let through absurdely large tests
  if (problems.length > config.MAX_PROBLEM_COUNT) {
    callback('Expected problems to be MAX_PROBLEM_COUNT or less');
    return;
  }

  var allCorrectStrings = true;
  _.each(problems, function (problem) {
    if (!allCorrectStrings) return;

    if (!_.isObject(problem)) allCorrectStrings = false;
    else if (!_.has(problem, 'uuid')) allCorrectStrings = false;
    else if (!_.isString(problem.uuid)) allCorrectStrings = false;
    else if (problem.uuid.length != 24) allCorrectStrings = false;
  });
  if (!allCorrectStrings) {
    callback('One or more elements in problems caused an error.');
    return;
  }
  // TODO: Check that uuids exist in db
  var allUUIDsFound = true;
  var collection = db.get('problemCollection');
  async.eachSeries(
    problems, 
    function iterator(problem, callback) {
      collection.findById(problem.uuid, function (error, problem) {
        if (error) {
          allUUIDsFound = false;
          console.log('instantiate(): error: ' + error);
          callback(error);
        } else {
          callback(null);
        }
      });
  },function done() {
    if (!allUUIDsFound) {
      callback('At least one problem when looking up uuids in db');
    } else callback();
  });
}
module.exports = mathstuff;
