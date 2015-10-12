var loginstuff = {};

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
  collection.findOne({username: username, password: password}, function (err, doc){
    if (err) callback(err, null);
    else if (doc) callback(null, true);
    else callback(new Error("wrong username or password"), false);
  });
}
module.exports = loginstuff;