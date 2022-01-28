var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var passport = require('passport')
var authenticate = require('./authenticate')

var usersRouter = require('./routes/userRouter');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');
var uploadRouter = require('./routes/uploadRouter');
var favoriteRouter = require('./routes/favoriteRouter')
var commentRouter = require('./routes/commentRouter');
var dotenv = require('dotenv').config()
const mongoose = require('mongoose');

var app = express();

// Secure traffic only
/*
this code is commented because we are hosting on heroku which iteself provide secure traffic
app.all('*', (req, res, next) => {
  if (req.secure) {
    return next();
  }
  else {
    res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
  }
});
*/

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize())

app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);
app.use('/imageUpload', uploadRouter);
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);
app.use('/favorites', favoriteRouter);
app.use('/comments', commentRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // log the error message
  res.status(err.status || 500)
  console.error(err)
  res.json({ err: err.message })
});

const url = process.env.MONGODB_URL
const connect = mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
connect.then((db) =>{
  console.log('Connected to server')
}, (err) => {
  console.log(err)
})
module.exports = app;
