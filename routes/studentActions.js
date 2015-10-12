var express = require('express');
var router = express.Router();
var mathstuff = require('../bin/problem_logic.js');
var _ = require('underscore');

/*
This serves a html formatted quiz to the student.
*/
router.get('/quiz/:uuid', function (req, res, next) {
  mathstuff.getQuizInstance(
    req.params.uuid, 
    req.db, 
    function successCallback(quizInstance) {
      // if submitted, show result page
      // if not, show quiz page
      if (quizInstance.submitted) {
        res.render('quizResult', {
          quiz: quizInstance
        });
      }
      else {
        res.render('quizInstance', {
          test: quizInstance.problems, 
          title: quizInstance.title, 
          problemCount: quizInstance.problems.length,
          uuid: req.params.uuid
        });
      }
    }, 
    function errorCallback (error) {
      next();
    });
});

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


module.exports = router;
