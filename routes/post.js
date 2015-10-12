var express = require('express');
var router = express.Router();
var mathstuff = require('../bin/problem_logic.js');
var _ = require('underscore');

/*
post data need to be an object with elements 
 - quizId, a quizInstance iD
 - answers, an array with solutions
*/
router.post('/submitQuiz', function (req, res){
  if(!req.body || 
     !_.has(req.body, 'answers') || !_.isArray(req.body.answers) ||
     !_.has(req.body, 'uuid')
     ) {
    console.log('Error at POST /submitQuiz. Incorrect data in body. ');
    res.status(400).send('data missing');
    return;
  }
  mathstuff.submitQuiz(
    req.body.uuid,
    req.body.answers,
    req.db, 
    function success(result) {
      res.send();
    },
    function error(error) {
      console.error(error);
      res.status(400).send(error);
    });  
});


// TODO POST /register

module.exports = router;