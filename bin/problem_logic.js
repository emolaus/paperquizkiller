var mathjs = require('mathjs');
var _ = require('underscore');
var async = require('async');
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
  if (_.isFunction(finalCallback)) console.log("finalCallback is function");
  else console.log("finalCallback is " + typeof(finalCallback));
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
  /*
  _.each(uuids, function (element) {
    // TODO: project objects to limit function
    collection.findById(element.uuid, function (error, problem) {
      if (error) console.log('instantiate(): error: ' + error);
      else {
          instantiatedTest.push(setOne(problem));
      }
    });
  });*/
  //return instantiatedTest;
}

module.exports = mathstuff;
