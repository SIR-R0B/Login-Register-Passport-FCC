'use strict';

const express       = require('express');
const bodyParser    = require('body-parser');
const fccTesting    = require('./freeCodeCamp/fcctesting.js');

// use session to store cookies for session, passport for authentication, mongodb for database
const session       = require('express-session');
const passport      = require('passport');
const mongo         = require('mongodb').MongoClient;
const routes        = require('./routes.js');
const auth          = require('./auth.js');

const app = express();

app.set('view engine', 'pug');

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// set up express session with salt from .env
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
}));

// set up server to use passport
app.use(passport.initialize());
app.use(passport.session());

// connect to MongoDB (via mLab) only ONCE, start server once connection established
mongo.connect(process.env.DATABASE, (err, db) => {
  if(err) {
    console.log('Database error: ' + err);
  } else {
    console.log('Successful database connection');

    auth(app,db);
    routes(app,db);
   
    // app.listen - start server
    app.listen(process.env.PORT || 3000, () => {
      console.log("Listening on port " + process.env.PORT);
    });
  }

});


