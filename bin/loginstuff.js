var loginstuff = {};
var _ = require('underscore');
var config = require('../config/serverconfig.js');
/**
 * Middleware to enforce login of teachers
 */
loginstuff.login = function (req, res, next) {
  console.log('At login');
  console.log(JSON.stringify(req.cookies));
  if (!_.has(req.cookies, 'user') ||
      !_.has(req.cookies.user, 'username')) {
    if (req.method === 'GET') res.cookie('pendingRedirect', {url: req.url}, {maxAge: config.COOKIE_MAX_AGE});
    console.log('No cookie set. Redirect.');
    res.redirect('/register');
    return;
  }
  next();
}
/**
 * callback(error, success) 
 */
loginstuff.registerLight = function (db, username, password, callback) {
  // Check if username is already registered in db
  var collection = db.get('usersLight');
  collection.findOne({username: username}, function (err, doc){
    if (err) callback(err, null);
    else if (doc) callback(new Error("username taken"), false);
    else {
      // Username not taken. Insert username and password
      collection.insert({username: username, password: password}, function (err, doc) {
        if (err) callback(err, false);
        else callback(null, true);
      });
    }
  });
}
/**
 * callback(error, success)
 */
loginstuff.loginLight = function (db, username, password, callback) {
  // Check if email and password exists in db
  // If yes, return success: true
  // If no, return error
  var collection = db.get('usersLight');

  collection.findOne({username: username, password: password}, function (err, doc) {
    console.log('error: ' + JSON.stringify(err));
    console.log('doc: ' + JSON.stringify(doc));
    if (err) callback(err, false);
    else if (doc) callback(null, {userUuid: doc._id});
    else callback(new Error("wrong username or password"), false);
  });
}
module.exports = loginstuff;