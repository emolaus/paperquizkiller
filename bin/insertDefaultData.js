var problems = [
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
  insertInto(db, 'problem_collection', problems);
/*  var problem_collection = db.get('problem_collection');
    problem_collection.find({},{},function (e, problems){
    debugger;   
    if (!e && problems.length == 0) {
      // insert some default data
      problem_collection.insert(problems, function (err, doc){
      });
    }
  });*/
}
function insertInto(db, collection, data) {
  var collectionHandle = db.get(collection);
  collectionHandle.find({},{},function (e, docs){
    if (!e && docs.length == 0) {
      // insert some default data
      collectionHandle.insert(data, function (err, doc) {
        debugger;
        console.log("Inserted default data in collection " + collection);
      });
    }
  });
} 
