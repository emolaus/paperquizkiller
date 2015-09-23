var mathjs = require('mathjs');
var _ = require('underscore');
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
  problem.instantiated = newText;  
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
Pass two arguments: a db handle and either 
- an array of problem uuid's + db-handle) or
- Not implemented: Pass uuid of testtemplate

Returns a complete test, i.e. an array of instantiated problems
*/
mathstuff.instantiate = function (db, arg2) {
  // 
  if (_.isObject(db) && _.isArray(arg2)) {
    var uuids = arg2;
    // TODO: fetch all problems
    var collection = db.get('problemCollection');
    _.each(uuids, function (element) {
      // HERE
      collection.findById(element.uuid, function () {});
    });
    // For each that is parametrized, instantiate
    // Return list of problems
    return [];
  }
  // TODO instantiate from testtemplate uuid
}

module.exports = mathstuff;
