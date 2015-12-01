var mathjs = require('mathjs');
var _ = require('underscore');
var async = require('async');
var config = require('../config/serverconfig.js');
var mathstuff = {};

var nouns = require('../other/nouns_6short.json');
var adjectives = require('../other/adjectives_6short.json');

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
/* Instantiate a problem. The returning object has elements
- problemId (uuid)
- parameters {A: 3, B: 4}
- solution (string if )
 */

function setOne(problem, seed) {
  // for each parameter
    // while "_" + parameter found in problem text
    // replace "_" + parameter with randomized value
  var instantiatedProblem = {};
  instantiatedProblem.problemId = problem._id;
  // In case the solution is hard coded. 
  var newText = problem.text;
  var solution = problem.solution;
  if (_.has(problem, 'parameters')) {
    instantiatedProblem.parameters = {};
    for (var param in problem.parameters){
      if (problem.parameters.hasOwnProperty(param)) {
        var paramObj = problem.parameters[param];
        var setVal = setParameter(paramObj, seed);
        //problem.parameters[param].instantiated = setVal;
        while (newText.search("_" + param) > -1) {
          newText = newText.replace("_" + param, setVal);
        }
        while (solution.search("_" + param) > -1) {
          solution = solution.replace("_" + param, setVal);
        }
        instantiatedProblem.parameters[param] = setVal;
      }
    }
    try { solution = mathjs.eval(solution); } 
    catch (e) {
      console.error('Failed calculating error at problem_logic.js. Problem: ' + problem._id);
    }
    //solution = calculateSolution();
  }
  instantiatedProblem.text = newText;  
  instantiatedProblem.solution = solution; 
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
          var instantiatedProblem = setOne(problem);
          instantiatedTest.push(instantiatedProblem);
          callback(null);
        } else {
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
  Expects a quiz object (see verifyQuiz()), a user id and a db handle.
  errorCallback(error): error is an error message as a string
  TODO: validate userUuid
*/
mathstuff.insertQuiz = function (quiz, db, userUuid, successCallback, errorCallback) {
  mathstuff.verifyQuiz(quiz, db,
    function () {
      // At this point we have a valid quiz object. Time to insert into db.
      // Question: perhaps better to flatten problem array to array of id's?
      // Would make find() easier
      var flattenedProblems = [];
      _.each(quiz.problems, function (problem) {
        flattenedProblems.push(problem.uuid);
      });
      // TODO insertionDate should be creationDate
      var newQuiz = {
        title: quiz.title, 
        userUuid: userUuid,
        problems: flattenedProblems,
        insertionDate: new Date()
      };
      var collection = db.get('quizCollection');
      collection.insert(newQuiz, function (err, doc) {
        if (err) errorCallback('Failed inserting quiz');
        else if (doc) { 
          successCallback(doc._id.valueOf());
        } else {
          errorCallback('Failed creating quiz');
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
  Returns successCallback({success: true, quizId: uuid, instanceIndex: instanceIndex});
  // TODO verify userUuid
*/
mathstuff.instantiateQuiz = function (db, nameOfClass, username, userUuid, quizUuid, successCallback, errorCallback) {

  mathstuff.verifyQuizExists(
    quizUuid,
    db, 
    function exists(doc) {
      // OK to insert!
      // TODO: set array field instantiations in quiz [{date: ...}]
      // TODO: create all instantiations, point back to quiz and instance nr
      var collection = db.get('quizCollection');
      collection.updateById(
        quizUuid,
        {$push: {instances: {creationDate: new Date(), userUuid: userUuid, username: username}}},
        function (err, doc) {
          if (err) {
            console.error('At instantiateQuiz: failed updating quiz with new instance object.');
            errorCallback('Error updating quiz with new instance.');
            return;
          } 
          else {
            // Success. Check length of the instances array
            collection.findById(quizUuid, function (err, quiz){
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
                // fetch class and for each student, generate a quizInstance
                var classCollection = db.get('classCollection');
                classCollection.findOne({teacher: username, name: nameOfClass}, function (error, classObject) {
                  if (error) { 
                    errorCallback('Couldnt find class.');
                    return;
                  }
                  if (!classObject) {
                    errorCallback('Couldnt find class.');
                    return;
                  }
                  if (_.isEmpty(classObject.students) || !classObject.students) {
                    errorCallback('No students in the given class.');
                    return;
                  }

                  var count = classObject.students.length;
                  var instances = [];
                  var someErrorOccurred = false;
                  var countInstances = 0;
                  async.whilst(
                    function () {return countInstances < count},
                    function (callback) {
                      mathstuff.instantiate(
                        db, 
                        quizUuid, 
                        function success(problems) {
                          instances.push(
                          {
                            quizId: quizUuid,
                            title: quiz.title,
                            index: countInstances+1, // Looks better to start at 1
                            instanceIndex: instanceIndex,
                            problems: problems,
                            teacher: username,
                            student: classObject.students[countInstances].name
                          });
                          countInstances++;
                          callback();
                        }, 
                        function error(e) {
                          someErrorOccurred = true;
                          console.error(e);
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
                          successCallback({success: true, quizId: quizUuid, instanceIndex: instanceIndex});
                        }
                      });
                    }
                  );
  
                  
                });
                
              }

            });
          }
        });
    },
    errorCallback
  );
}
/*
  successCallback(quiz object)
  errorCallback(error string)

  TODO: could just be called getQuiz since it returns the found quiz
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
/*
  fetch a quiz instance from quizInstanceCollection
*/
mathstuff.getQuizInstance = function (uuid, db, successCallback, errorCallback) {
  // Sanitize data
  if (!verifyUUIDFormat(uuid)) {
    errorCallback('Invalid quiz instance uuid');
    return;
  }
  // Check so that uuid exists in db
  var collection = db.get('quizInstanceCollection');
  collection.findById(uuid,function (err, doc) {
    if (err) errorCallback('Quiz not found in db.');
    else if (doc) {
      successCallback(doc);
      console.log(JSON.stringify(doc));
    } else errorCallback('Quiz instance not found. No error given.');
  });
}
/* 
  Requires the uuid of the original/template quiz and index of instance (index in quiz.instances array)
  Returns meta data of quiz instances, i.e. all data execept actual questions.
*/
mathstuff.getAllQuizInstances = function (uuid, instanceIndex, db, successCallback, errorCallback) {
  // Instance index should be a string representing a number. Check and clean.
  if (!_.isString(instanceIndex)) {
    errorCallback('Wrong instanceIndex');
    return;
  }
  instanceIndex = parseInt(instanceIndex);
  if (isNaN(instanceIndex)) {
    errorCallback('Wrong instanceIndex');
    return;
  }

  // Check existence of original quiz. uuid is checked in verifyQuizExists so no need to do it here
  mathstuff.verifyQuizExists(
    uuid,
    db, 
    function quizFound(quiz) {
      // Original quiz exists. Look up all instances that match the uuid and instanceIndex
      // Those fields are called quizId and instanceIndex.
      var query = {quizId: uuid, instanceIndex: instanceIndex};
      console.log(JSON.stringify(query))
      
      var collection = db.get('quizInstanceCollection');
      collection.find(query, function (err, docs) {
        if (err) {
          console.error('getAllQuizInstances: error. ' + err);
          errorCallback('Failed fetching quiz instances.');
        } else if (docs) {
          successCallback(docs);
        } else {
          errorCallback('No quiz instances found.');
        }
      });
    },
    errorCallback
    );
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
mathstuff.submitQuiz = function(uuid, answers, db, successCallback, errorCallback) {
  if (!_.isArray(answers)) {
    errorCallback('submit quiz failed. bad arguments. ');
    return;
  }
  mathstuff.getQuizInstance(
    uuid, 
    db, 
    function foundQuiz(quiz) {
      // Sanity check: answers has same length as quiz problems.
      if (!_.has(quiz, 'problems')) errorCallback('db error. quiz has no problem set. ');
      else if (!_.isArray(quiz.problems)) errorCallback('db error. quiz problem set corrupt.');
      else if (quiz.problems.length != answers.length) errorCallback('submit quiz failed. answers array didn\'t match quiz problem set.');
      else {
        // Save the result in lighter array to return to client
        var resultArray = Array(quiz.problems.length);
        quiz.submitted = true;
        for (var i = 0; i < answers.length; i++) {
          quiz.problems[i].result = quiz.problems[i].solution == answers[i];
          quiz.problems[i].answer = answers[i];
          resultArray[i] = quiz.problems[i].result;
        }       
        var collection = db.get('quizInstanceCollection'); 
        // TODO: DOESN'T UPDATE QUIZ!
        var uuid = quiz._id;
        delete(quiz._id);
        collection.updateById(uuid, quiz, function (error, doc) {
          if (error) {
            errorCallback('Failed inserting results to db');
            console.error('Failed updating quiz instance ' + quiz.uuid + '. quiz object dump:');
            console.error(JSON.stringify(quiz));
          } 
          else successCallback(resultArray);
        });
      }
    }, 
    errorCallback);
}
/**
 * Simplified version. Only searching quizzes created by user.
 * callback(err, doc)
 * Returns an array of quizzes. The instances array has been cleared of userUuid
 */
mathstuff.getAllQuizzesRelatedToUser = function (db, userUuid, callback) {
  var collection = db.get('quizCollection');
  collection.find({userUuid: userUuid}, ['-problems', '-userUuid'], function (error, docs) {
    if (error) callback(error, null);
    else if (!docs) callback(null, []);
    else {
      // for each quiz, and for each instances array element. Remove where not user
      _.each(docs, function (quiz) {
        var cleanedInstances = [];
        _.each(quiz.instances, function (instanceDescription, index) {
          if (instanceDescription.userUuid === userUuid) cleanedInstances.push({creationDate: instanceDescription.creationDate, instanceIndex: index});
        });
        quiz.instances = cleanedInstances;
      });
      var quizInstanceCollection = db.get('quizInstanceCollection');
      // for each doc, get summaric statistics (nr of instances, nr of submissions)
      async.eachSeries(
        docs, 
        function iterator(quiz, asyncCallback) {
          // search quizInstanceCollection for all instances.
          // Keep track of nr of instances and if they are submissed.
          async.eachSeries(
            quiz.instances,
            function (instanceDescription, asyncInnerCallback) {
              // quizId: quiz._id doesn't work.
              var query = {quizId: quiz._id.toHexString(), instanceIndex: instanceDescription.instanceIndex};
              quizInstanceCollection.find(query, function (err, quizInstances){
                // Expecting an array of instances representing all quizzes sent out on a given occation.
                var instanceCount = 0;
                var submittedCount = 0;
                if (err) {
                  asyncInnerCallback(err); 
                  return;
                } else if (!quizInstances) {
                  instanceCount = 0;
                  submittedCount = 0;
                } else {
                  // calculate how many instances there are and how many were submitted
                  instanceCount = quizInstances.length;
                  submittedCount = _.where(quizInstances, {submitted: true}).length;
                }
                instanceDescription.instanceCount = instanceCount;
                instanceDescription.submittedCount = submittedCount;
                asyncInnerCallback();
              });
            },
            function done() {
              asyncCallback();
            });
        },function done() {
          callback(null, docs); 
      });
    }
  });
};
/*
  Returns summary of quiz results:
  ['roblem index, Nr of submitted ansmwers, Nr of correct answers]
  [
    ['1', 5, 4],
    ['2', 3, 2]
  ]
  
*/
mathstuff.getQuizResultSummary = function (db, quizUuid, instanceIndex, finalCallback) {
  var resultingData = [];
  // collect all quiz responses
  var collection = db.get('quizInstanceCollection');
  var query = {quizId: quizUuid, instanceIndex: instanceIndex}; 
  collection.find(query, function (error, quizInstances){
    if (error) finalCallback(error, null);
    else if (_.isEmpty(quizInstances)) finalCallback(null, resultingData);
    else {
      // insert placeholder arrays into resultingData
      _.each(quizInstances[0].problems, function (problem, index) {
        resultingData.push([index + 1,0,0]);
      });
      // populate resultingData values
      _.each(quizInstances, function (quizInstance) {
        _.each(quizInstance.problems, function (problem, problemIndex) {
          if (_.has(problem, 'answer')) resultingData[problemIndex][1]++;
          if (problem.result) resultingData[problemIndex][2]++;
        });
      });
      finalCallback(null, resultingData);
    }
  }); 
};

mathstuff.createClass = function(db, username, nameOfClass, studentList, finalCallback) {
  // TODO Check input
  // Check so that name isn't taken
  var collection = db.get('classCollection');
  collection.findOne({teacher: username, name: nameOfClass}, function (error, foundClass) {
    if (error) {
      finalCallback('Unable to search database', false);
      return;
    }
    // Possible source of error - what is returned if no class found?
    if (foundClass) {
      finalCallback('You already have a class with that name.', false);
      return;
    }
    var students = [];
    _.each(nameOfClass, function (studentName) {
      var student = {
        name: studentName,
        creationDate: new Date(),
        pin: mathjs.pickRandom(adjectives) + '_' + mathjs.pickRandom(nouns) + Math.floor(Math.random()*9000 + 1000)
      };
      students.push(student);
    });
    // Found class. Insert.
    var newClass = {
      name: nameOfClass, 
      teacher: username,
      students: students,
      creationDate: new Date()
    };
    collection.insert(newClass, function (error, doc) {
      if (error) finalCallback(error, false);
      else if (!doc) finalCallback('Failed without error message', false);
      else finalCallback(null, true);
    });
    
  });
};
mathstuff.getClassesOfUser = function (db, username, finalCallback) {
  var collection = db.get('classCollection');
  collection.find({teacher: username}, function (error, docs) {
    if (error) finalCallback(error, null);
    else if (!docs) finalCallback(null, []);
    else finalCallback(null, docs);
  });
};
module.exports = mathstuff;
