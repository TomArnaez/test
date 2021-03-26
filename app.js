const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const passport = require('passport');
require("./passport")(passport)
const db = require("./models");
db.sequelize.sync();

//var usersRouter = require('./routes/users');
const searchRouter = require("./routes/search");
const apiRouter = require("./routes/api");
const postRouter = require("./routes/posts");
const contactRouter = require('./routes/email');
const messageRouter = require('./routes/message');

const media = require('./media_impl')
media.setupSync()
const session = require('express-session');
const flash = require('connect-flash');
require("./passport")(passport)

const adminLoginRouter = require('./routes/admin_login');
const adminDashboardRouter = require('./routes/admin_dashboard');
const indexRouter = require('./routes/index');
const editRouter = require('./routes/edit.js');const mediaRouter = media.mediaRoute
const uploadRouter = media.uploadRoute

const app = express();
app.disable("x-powered-by");
app.disable("x-powered-by");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// bootstrap setup
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/popper.js/dist')));
app.use(express.static(path.join(__dirname, '/public')));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));

// using bootstrap
app.use(express.static(path.join(__dirname, "public")));
app.use("/stylesheets/css", express.static(path.join(__dirname, "node_modules/bootstrap/dist/css")));
// app.use('/css', express.static(__dirname + 'node_modules/bootstrap/dist/css'));

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
});

adminLoginRouter.use('/dashboard', adminDashboardRouter)
adminLoginRouter.get('/media', media.mediaManger)
adminLoginRouter.use('/upload', uploadRouter)

app.use(async (req, res, next) => {
  const db = require("./models");
  const Op = require("sequelize").Op;
  const Term = db.Term;
  const Post = db.Post;
  const Message = db.Message;
  res.locals.categories = await Term.findAll({ where: {termType: 'category'} });
  res.locals.tags = await Term.findAll({where: {termType: 'tag'}});
  res.locals.posts = await Post.findAll({include: { model: Term, as: "terms"}});
  res.locals.messages = await Message.findAll({where: {is_public: 0, response: {[Op.ne]: null}}, attributes: ['title', 'custom_id', 'url']});
  next();
});


app.use('/', indexRouter);
app.use('/admin', adminLoginRouter);
app.use('/', contactRouter);
app.use('/', messageRouter);
app.use('/edit', editRouter);
app.use('/media', mediaRouter);
//app.use('/users', usersRouter);
app.use('/search', searchRouter);
app.use('/api', apiRouter);
app.use('/posts', postRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
