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
mathstuff.instantiate = function (db, arg2, successCallback, errorCallback) {
  // array passed?
  if (_.isObject(db) && _.isArray(arg2)) {
    instantiateFromProblemUUIDs(db, arg2, successCallback, errorCallback);
    return;
  }
  // TODO instantiate from testtemplate uuid
  else if (_.isObject(db) && _.isString(arg2))
  {
    var found = function (doc) {
      // setup array in right format
      problems = [];
      _.each(doc.problems, function (problem) {
        problems.push({uuid: problem});
      });
      // instantiate
      instantiateFromProblemUUIDs(db, problems, successCallback, errorCallback);
    };
    mathstuff.verifyQuizExists(arg2, db, found, errorCallback);
    
  }
}
function instantiateFromProblemUUIDs(db, uuids, successCallback, errorCallback) {
  var instantiatedTest = [];
  var collection = db.get('problemCollection');
  var someErrorOccurred = false;
  async.eachSeries(
    uuids, 
    function iterator(item, callback) {
      collection.findById(item.uuid, function (error, problem) {
        if (error) {
          console.log('instantiate(): error: ' + error);
          someErrorOccurred = true;
          callback(error);
        } else if (problem) {
          console.log('instantiateFromProblemUUIDs interation. received problem: ' + JSON.stringify(problem));
          var instantiatedProblem = setOne(problem);
          instantiatedTest.push(instantiatedProblem);
          callback(null);
        } else {
          console.log('instantiate() problem not found and no error given. problem: ' + item.uuid);
          someErrorOccurred = true;
          callback(null);
        }
      });
  },function done() {
    if (someErrorOccurred) {
      console.error('at instantiateFromProblemUUIDs: failed at some point.');
      errorCallback('instantiate problem failed at some point. ');
    }
    else successCallback(instantiatedTest);
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
          successCallback(doc._id);
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
    else if (!verifyUUIDFormat(problem.uuid)) allCorrectStrings = false;
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
/*
  Expects the uuid of the template quiz and the number of instantiations
*/
mathstuff.instantiateQuiz = function (uuid, count, db, successCallback, errorCallback) {
  // Sanitize data
  if (!_.isNumber(count) ||
      count < 0 ||
      count > config.MAX_QUIZ_INSTANTIATIONS) {
    errorCallback('Too many instantiations');
    return;
  } 
  mathstuff.verifyQuizExists(
    uuid, 
    db, 
    function exists(doc) {
      // OK to insert!
      // TODO: set array field instantiations in quiz [{date: ...}]
      // TODO: create all instantiations, point back to quiz and instance nr
      var collection = db.get('quizCollection');
      collection.updateById(
        uuid,
        {$push: {instances: {creationDate: new Date()}}},
        function (err, doc) {
          if (err) {
            console.error('At instantiateQuiz: failed updating quiz with new instance object.');
            errorCallback('Error updating quiz with new instance.');
            return;
          } 
          else {
            // Success. Check length of the instances array
            collection.findById(uuid, function (err, quiz){
              if (err) {
                errorCallback('Couldn\'t find the quiz');
              } else if (quiz) {
                var instanceIndex = quiz.instances.length - 1;
                if (instanceIndex < 0) {
                  errorCallback('Something went wrong when creating new instance. '); 
                  return;
                }
                // At this point, we have added an instance (a date) into the original quiz,
                // and we have figured out which index it has. Now instantiate a bunch of tests.
                var instances = [];
                var someErrorOccurred = false;
                // Replace this with async.whilst
                var countInstances = 0;
                async.whilst(
                  function () {return countInstances++ < count},
                  function (callback) {
                    console.log('instantiating nr ' + countInstances);
                    mathstuff.instantiate(
                      db, 
                      uuid, 
                      function success(problems) {
                        instances.push(
                        {
                          quizId: uuid,
                          instanceIndex: instanceIndex,
                          problems: problems
                        });
                        callback();
                      }, 
                      function error(error) {
                        someErrorOccurred = true;
                        console.error(error);
                        callback();
                      } 
                    );
                  },
                  function lastly (){

                    var quizInstanceCollection = db.get('quizInstanceCollection');
                    // At this point we have a bunch of quiz instance db objects.
                    // Insert all into db.
                    quizInstanceCollection.insert(instances, function (err, doc) {
                      if (err) {
                        errorCallback('Failed creating instances.');
                      } else {
                        successCallback({success: true, quizId: uuid, instanceIndex: instanceIndex});
                      }
                    });
                  }
                );

              }

            });
          }
        });
    },
    errorCallback
  );
}
/*
  successCallback(doc)
  errorCallback(errorString)
*/
mathstuff.verifyQuizExists = function(uuid, db, successCallback, errorCallback) {
  // Sanitize data
  if (!verifyUUIDFormat(uuid)) {
    errorCallback('Invalid quiz uuid');
    return;
  }
  // Check so that uuid exists in db
  var collection = db.get('quizCollection');
  collection.findById(uuid,function (err, doc) {
    if (err) errorCallback('Quiz not found in db.');
    else if (doc) successCallback(doc);
    else errorCallback('Quiz not found. No error given.');
  });
}
/* Check that argument is string of length 24 with correct characters */
function verifyUUIDFormat(possiblyUUID) {
  if (!_.isString(possiblyUUID)) return false;
  if (possiblyUUID.length != 24) return false;
  
  // Check so that characters are correct
  for (var i = 0; i < possiblyUUID.length; i++) {
    if (_.indexOf('abcdef0123456789', possiblyUUID[i]) < 0) return false;
  }
  return true;
}
module.exports = mathstuff;
