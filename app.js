const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const media = require('./media_impl')
media.setupSync()
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
require("./passport")(passport)

const adminLoginRouter = require('./routes/admin_login');
const adminDashboardRouter = require('./routes/admin_dashboard');
const indexRouter = require('./routes/index');
const editRouter = require('./routes/edit.js');const mediaRouter = media.mediaRoute
const uploadRouter = media.uploadRoute

const app = express();
app.disable("x-powered-by");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));


//express session
app.use(session({
  secret : 'secret',
  resave : true,
  saveUninitialized : true
}));
app.use(passport.initialize());
app.use(passport.session());

//use flash
app.use(flash());
app.use((req,res,next)=> {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error  = req.flash('error');
  res.locals.html_success_msg = req.flash('html_success_msg')
  next();
})

adminLoginRouter.use('/dashboard', adminDashboardRouter)
adminLoginRouter.get('/media', media.mediaManger)
adminLoginRouter.use('/upload', uploadRouter)

app.use('/', indexRouter);
app.use('/edit', editRouter);
app.use('/admin', adminLoginRouter);
app.use('/media', mediaRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
