module.exports = function(db) {
  insertInto(db, 'problemCollection', problems);
  /*  var problem_collection = db.get('problem_collection');
      problem_collection.find({},{},function (e, problems){
      debugger;   
      if (!e && problems.length == 0) {
        // insert some default data
        problem_collection.insert(problems, function (err, doc){
        });
      }
    });*/
};

function insertInto(db, collection, data) {
  var collectionHandle = db.get(collection);
  collectionHandle.find({}, {}, function(e, docs) {
    if (!e && docs.length === 0) {
      console.log('insertInto: no data found. inserting some...');
      // insert some default data
      collectionHandle.insert(data, function(err, doc) {
        console.log('insertInto: Inserted default data in collection ' + collection);
      });
    } else if (e) {
      console.log('insertInto: Error');
    }
  });
}

var problems = [{
  text: '1+1=',
  solution: '3',
  tags: ['arithmetic', 'basic']
}, {
  text: '_A+_B=',
  solution: '_A+_B',
  tags: ['arithmetic', 'basic'],
  parameters: {
    A: {
      set: [1, 2, 3, 4, 5]
    },
    B: {
      set: [1, 2, 3, 4, 5]
    }
  }
}, {
  text: '_A-_B=',
  solution: '_A-_B',
  tags: ['arithmetic', 'basic'],
  parameters: {
    A: {
      set: [1, 2, 3, 4, 5]
    },
    B: {
      set: [1, 2, 3, 4, 5]
    }
  }
}, {
  text: '_A+(_B)=',
  solution: '_A+_B',
  tags: ['arithmetic'],
  parameters: {
    A: {
      set: [1, 2, 3, 4, 5]
    },
    B: {
      set: [-1, -2, -3, -4, -5]
    }
  }
}, {
  text: '_A-(_B)=',
  solution: '_A-_B',
  tags: ['arithmetic'],
  parameters: {
    A: {
      set: [1, 2, 3, 4, 5]
    },
    B: {
      set: [-1, -2, -3, -4, -5]
    }
  }
}, {
  text: '_A+X=_B',
  solution: '_B-_A',
  tags: ['algebra'],
  parameters: {
    A: {
      set: [1, 2, 3, 4, 5]
    },
    B: {
      set: [-1, -2, -3, -4, -5]
    }
  }
}, {
  text: '\\int__A^_B x dx',
  solution: '_B*_B / 2 - _A*_A/2',
  tags: ['calculus', 'basic', 'integral'],
  parameters: {
    A: {
      set: [1,2,3]
    },
    B: {
      set: [4,5,6]
    }
  }
}
];

