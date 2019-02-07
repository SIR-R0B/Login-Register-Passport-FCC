const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const ObjectID      = require('mongodb').ObjectID;
const bcrypt        = require('bcrypt');


module.exports = function (app,db) {
  
  // serialization
    // set up functions for serialization (user -> key) and deserialization (key -> user)
    passport.serializeUser((user, done) => {
       done(null, user._id);
     });

    passport.deserializeUser((id, done) => {
      db.collection('freeCodeCampUsers').findOne({_id: new ObjectID(id)}, (err, doc) => {
        done(null, doc);
      });
    });
    
    // password authentication
    passport.use(new LocalStrategy(
      function(username, password, done) {
        db.collection('freeCodeCampUsers').findOne({ username: username }, function (err, user) {
          console.log('User '+ username +' attempted to log in.');
          
          if (err) { return done(err); }
          
          if (!user) { return done(null, false); }
          
          if (!bcrypt.compareSync(password, user.password)) { return done(null, false); }
          //if (password !== user.password) { return done(null, false); }
          
          return done(null, user);
        });
      }
    ));
    
  
}