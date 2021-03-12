var express = require('express');
const db = require('../database.js');
const passport = require('passport');
var router = express.Router();

//Add admin login authentication check

//if /edit is used, then user is redirected to create a new edit section
router.get('/', function(req, res, next) {
  if (req.isAuthenticated()) {
      res.redirect("/edit/new");
  } else {
      req.flash('error_msg', 'You are not authenticated.');
      res.redirect("/admin/login");
  }
});

router.get('/new', function (req, res, next) {
  if (req.isAuthenticated()) {
      res.render('text_editor', {title: 'Content Editor', postname:'', doc: null});
  } else {
      req.flash('error_msg', 'You are not authenticated.');
      res.redirect("/admin/login");
  }
})

router.post('/new', function (req, res) {

  //gets data from form posted.
  const title = String(req.body.filename);
  const data = String(req.body.content);

  //checks that file with same title doesn't already exist in database, throws error if true and returns user to index
  db.query("SELECT title FROM posts WHERE ? IN (title) LIMIT 1;", [title], function(err, result) {
      if (err) {
          //throws error
          console.log(err + ' db error when selecting');
      }
      if (result.length > 0) {
          console.log(result);
          console.log('error: file already exists in db');
          res.redirect('/');
      } else {
          //inserts file into database if it doesn't already exist
          db.query("INSERT INTO posts (title, text, html) VALUES (?, ?, ?);", [title, data, data], function(err, result) {
              if (err){
                  console.log(err + ' db error when inserting');
                  res.redirect('/')
              } else {
                  console.log('Sucesfully saved file');
                  res.redirect('/');
              }
          });
      }
  });

})


//takes you to edit a post given the id
router.get('/:id', function (req, res, next) {
  var post_id = req.params.id;
  if (req.isAuthenticated()) {
    db.query("SELECT title, html FROM posts WHERE ? IN (id) LIMIT 1;", [post_id], function(err, result) {
      if (err) {
        console.log("no post : " + err);
        req.flash('error_msg', 'Error connecteing with database')
      } else {
        console.log("result length = " + result.length);
        if (result.length != 0) {
          console.log("post exists: " + result[0].title);
          res.render('text_editor', {title: 'Content Editor', postname:result[0].title, doc:result[0].html});
        } else {
          req.flash('error_msg', 'No post with id: \'' + post_id + '\' in database');
          res.redirect('edit/new');
        }
      }
    });
  } else {
      req.flash('error_msg', 'You are not authenticated.');
      res.redirect("/admin/login");
  }

})

route.post('/:id', function (req, res, next) {

})

router.get('/:title', function (req, res) {
  if (req.isAuthenticated()) {
      res.redirect("/admin/dashboard");
      //add in code to redirect to correct ID
  } else {
      req.flash('error_msg', 'You are not authenticated.');
      res.redirect("/admin/login");
  }
})




//// TODO: Create edit, create, update, delete functions.

module.exports = router;
