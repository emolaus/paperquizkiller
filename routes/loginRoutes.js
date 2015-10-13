var express = require('express');
var router = express.Router();
var _ = require('underscore');
var loginstuff = require('../bin/loginstuff.js');
var config = require('../config/serverconfig.js');

router.get('/logout', function (req, res) { 
  res.clearCookie('user'); 
  res.clearCookie('quizzes');
  res.send('Logged out.'); 
});

router.get('/isLoggedIn', function (req, res) {
  if (_.has(req.cookies, 'user') &&
      _.has(req.cookies.user, 'username')) {
    res.send(req.cookies.user);
    return;
  } else {
    res.send(false);
  }
});

router.post('/login', function (req, res) {
  if(!req.body || 
     !_.has(req.body, 'username') || !_.isString(req.body.username) ||
     !_.has(req.body, 'password' || !_.isString(req.body.password))
     ) {
    console.log('Error at POST /login. Incorrect data in body. ');
    res.status(400).send('data missing');
    return;
  }
  loginstuff.loginLight(
      req.db,
      req.body.username,
      req.body.password,
      function (err, success) {
        if (err) {
          res.status(400).send(err);
        } else if (success) {
          // set cookie
          var userCookie = {username: req.body.username, userUuid: success.userUuid};
          res.cookie('user', userCookie, {maxAge: config.COOKIE_MAX_AGE});
          // If the pendingRedirect cookie is set, return that, else go to createQuiz
          if (_.has(req, 'cookies') &&
              _.has(req.cookies, 'pendingRedirect')) {
            res.clearCookie('pendingRedirect');
            res.send(req.cookies.pendingRedirect.url);
            return;
          }
          res.send('/createQuiz');
        } else {
          res.status(400).send('Failed without error message');
        }
      }
    );
});

module.exports = router;