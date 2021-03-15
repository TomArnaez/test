var express = require('express');
const db = require('../database.js');
const passport = require('passport');
var router = express.Router();

//if /edit is used, then user is redirected to create a new edit section
router.get('/', function(req, res, next) {
  if (req.isAuthenticated()) {
    db.query("SELECT id, title, html, created_on FROM posts;", [], function(err, result) {
      if (err){
          console.log(err + ' db error when updating');
          req.flash('error_msg', 'Error when accessing database');
          res.redirect('/')
      } else {
          console.log('Sucesful DB Query');
          res.render('posts_index', {title: 'Posts', results: result});
      }
    });
  } else {
      req.flash('error_msg', 'You are not authenticated.');
      res.redirect("/admin/login");
  }
});

router.get('/view/:id', function (req, res, next) {
  var post_id = req.params.id;
  if (req.isAuthenticated()) {
    db.query("SELECT title, html FROM posts WHERE ? IN (id) LIMIT 1;", [post_id], function(err, result) {
      if (err) {
        console.log("no post : " + err);
        req.flash('error_msg', 'Error connecteing with database')
        res.redirect('/edit/');
      } else {
        console.log("result length = " + result.length);
        if (result.length != 0) {
          console.log("post exists: " + result[0].title);
          res.render('Post', {title: 'Post Viewer', id:post_id, postname:result[0].title, doc:result[0].html});
        } else {
          req.flash('error_msg', 'No post with id: \'' + post_id + '\' in database');
          res.redirect('/edit/');
        }
      }
    });
  } else {
      req.flash('error_msg', 'You are not authenticated.');
      res.redirect("/admin/login");
  }
})

router.get('/new', function (req, res, next) {
  if (req.isAuthenticated()) {
      res.render('text_editor', {title: 'Content Editor', postname:null, doc: null});
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
                  res.redirect('/edit');
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

router.post('/:id', function (req, res, next) {
  const title = String(req.body.filename);
  const data = String(req.body.content);

  //inserts file into database if it doesn't already exist
  db.query("UPDATE posts SET title = ?, html = ? WHERE id = ?;", [title, data, req.params.id], function(err, result) {
      if (err){
          console.log(err + ' db error when updating');
          req.flash('error_msg', 'Error when accessing database');
          res.redirect('/edit');
      } else {
          console.log('Sucesfully saved file');
          req.flash('success_msg', 'Post Successfully updated');
          res.redirect('/edit');
      }
  });
})

router.post('/delete/:id', function(req, res, next) {
  var id = req.params.id;
  console.log("id = " + id);
  if (id != null) {
    db.query("DELETE FROM posts WHERE id = ?;", [id], function(err, result) {
        if (err){
            console.log(err + ' db error when deleting');
            req.flash('error_msg', 'Error when accessing database');
            res.redirect('/edit');
        } else {
            console.log('Sucesfully Deleted File');
            req.flash('success_msg', 'Post Deleted');
            res.redirect('/edit');
        }
    });
  }
})


//edit, create, update, delete functions.

module.exports = router;
