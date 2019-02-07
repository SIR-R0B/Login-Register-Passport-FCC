const passport = require('passport');
const bcrypt = require('bcrypt');

module.exports = function (app,db) {
  // api routes
    // index
    app.route('/')
      .get((req, res) => {
        res.render(process.cwd() + '/views/pug/index.pug', {title: 'Hello', message: 'Please login', showLogin: true, showRegistration: true});
      });

    // login
    app.route('/login')
      .post(passport.authenticate('local', { failureRedirect: '/' }), (req, res) => {
        res.redirect('/profile');
      });
  
  // middleware to ensure user is authenticated before displaying profile page
    function ensureAuthenticated(req, res, next) {
      // isAuthenticated() via passport
      if (req.isAuthenticated()) {
        return next();
      }
      
      res.redirect('/');
    };

    // profile page
    app.route('/profile')
      .get(ensureAuthenticated, (req, res) => {
        res.render(process.cwd() + '/views/pug/profile.pug', {username: req.user.username});
      });

    // logout
    app.route('/logout')
      .get((req, res) => {
        // logout via passport
        req.logout();
        res.redirect('/');
      });

    // registration via form POST to /register
    app.route('/register')
      .post((req, res, next) => {
        db.collection('freeCodeCampUsers').findOne({ username: req.body.username }, function (err, user) {
          if(err) {
            next(err);
          } else if (user) {
            // already registered
            res.redirect('/');
          } else {
            // create new db entry
            var hash = bcrypt.hashSync(req.body.password, 12);
            db.collection('freeCodeCampUsers').insertOne(
              {username: req.body.username,
               password: hash},
              (err, doc) => {
                if(err) {
                  res.redirect('/');
                } else {
                  next(null, user);
                }
              }
            );
          }
        })},
        passport.authenticate('local', { failureRedirect: '/' }),
        (req, res, next) => {
          res.redirect('/profile');
        }
    );
    
    // handle missing pages (404)
    app.use((req, res, next) => {
      res.status(404)
        .type('text')
        .send('Not Found');
    });
  
  
}