var mathjs = require('mathjs');
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
      problem_set[i].seed = seed;
    }
  } else {
    setOne(problem, seed);
    problem_set.seed = seed;
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
  if (Array.isArray(paramObj)) {
    return mathjs.pickRandom(paramObj);
  }
  return 1;
   
  // TODO if object, parse
}
module.exports = mathstuff;
