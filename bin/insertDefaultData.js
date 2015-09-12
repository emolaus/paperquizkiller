var defaultData = [
  {
    text: "_A+_B=",
    solution: "_A+_B",
    parameters: {
      A: {
        set: [1,2,3,4,5]
      },
      B: {
        set: [1,2,3,4,5]
      }
    }
  },
  {
    text: "_A-_B=",
    solution: "_A-_B",
    parameters: {
      A: {
        set: [1,2,3,4,5]
      },
      B: {
        set: [1,2,3,4,5]
      }
    }
  },
  {
    text: "_A+(_B)=",
    solution: "_A+_B",
    parameters: {
      A: {
        set: [1,2,3,4,5]
      },
      B: {
        set: [-1,-2,-3,-4,-5]
      }
    }
  },
  {
    text: "_A-(_B)=",
    solution: "_A-_B",
    parameters: {
      A: {
        set: [1,2,3,4,5]
      },
      B: {
        set: [-1,-2,-3,-4,-5]
      }
    }
  }
]

module.exports = function (db) {
  var problem_collection = db.get('problem_collection');
    problem_collection.find({},{},function (e, problems){
    debugger;   
    if (!e && problems.length == 0) {
      // insert some default data
      problem_collection.insert(defaultData, function (err, doc){
        debugger;
        console.log(err);
        console.log(doc);
      });
    }
  });
}
