const router = require('express').Router()
const User = require('../models/users');
const passport = require('passport');


router.post('/signup', (req, res) => {
  User.register(new User({ username: req.body.username }),
    req.body.password, (err, user) => {
    if(err) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json');
      res.json({ err: err })
    }
    else {
      passport.authenticate('local')(req, res, () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({ success: true, status: 'Registration Successful!' });
      })
    }
  })
})

router.post('/login', passport.authenticate('local'), (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({ success: true, status: 'You are successfully logged in!' });
  }
)


router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }
  else {
    let err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});

module.exports = router