var express = require('express');
const db = require('../database.js');
const passport = require('passport');
var router = express.Router();

//Takes user to posts index page
router.get('/', function(req, res, next) {
  //Checks user is an admin. Only admins can access editing router
  if (req.isAuthenticated()) {
    //Gets all posts in database
    db.query("SELECT id, title, html, created_on FROM posts;", [], function(err, result) {
      if (err){
          //error handling
          req.flash('error_msg', 'Error when accessing database');
          res.redirect('/')
      } else {
          res.render('posts_index', {title: 'Posts', results: result});
      }
    });
  } else {
      //Returns user to login
      req.flash('error_msg', 'You are not authenticated.');
      res.redirect("/admin/login");
  }
});

//Renders page to view a post using the ID of the post
router.get('/view/:id', function (req, res, next) {
  var post_id = req.params.id;

  //Checks user is an admin. Only admins can access editing router
  if (req.isAuthenticated()) {

    //Query to get the post from the database
    db.query("SELECT title, html FROM posts WHERE ? IN (id) LIMIT 1;", [post_id], function(err, result) {

      //error handling for database errors
      if (err) {
        req.flash('error_msg', 'Error connecteing with database')
        res.redirect('/edit/');
      } else {

        //Checks a post with the ID Exists and renders a page with the post
        if (result.length != 0) {
          res.render('Post', {title: 'Post Viewer', id:post_id, postname:result[0].title, doc:result[0].html});

        //Redirects user to Posts index if no post exists in the data base with the provided ID
        } else {
          req.flash('error_msg', 'No post with id: \'' + post_id + '\' in database');
          res.redirect('/edit/');
        }
      }
    });

  //Redirects user to login page if they are not logged in
  } else {
      req.flash('error_msg', 'You are not authenticated.');
      res.redirect("/admin/login");
  }
})

//Renders empty post editor to create a new post
router.get('/new', function (req, res, next) {

  //Checks user is an admin. Only admins can access editing router
  if (req.isAuthenticated()) {
      res.render('text_editor', {title: 'Content Editor', postname:null, doc: null});

  //Redirects user to login page if they are not authenticated
  } else {
      req.flash('error_msg', 'You are not authenticated.');
      res.redirect("/admin/login");
  }
})

//Saves post in database
router.post('/new', function (req, res) {

  //gets data from form posted.
  const title = String(req.body.filename);
  const data = String(req.body.content);

  //checks that file with same title doesn't already exist in database, throws error if true and returns user to index
  db.query("SELECT title FROM posts WHERE ? IN (title) LIMIT 1;", [title], function(err, result) {

      //Error handling for database connection
      if (err) {
          console.log(err + ' db error when selecting');
      }

      //  !!!!!
      // !!!!! Check if post already exists in database with same name. (Maybe should be removed??)
      //Re-renders edit page if yes. Maybe add a check on the edit page that doesn't post if this fails?
      if (result.length > 0) {
          req.flash('error_msg', 'Post with this title already exists in the database, Please change title');
          res.render('text_editor', {title: 'Content Editor', postname: title, doc: data});

      //Inserts new post into database
      } else {
          db.query("INSERT INTO posts (title, text, html) VALUES (?, ?, ?);", [title, data, data], function(err, result) {

              //Error handling for database connection
              if (err){
                req.flash('error_msg', 'Error connecting to database: ' + err);
                res.render('text_editor', {title: 'Content Editor', postname: title, doc: data});

              //Redirects user to posts index if upload was successful
              } else {
                  req.flash('success_msg', 'Successfully saved post to database');
                  res.redirect('/edit');
              }
          });
      }
  });

})

//Temporary. Routes user to intended feed. This was only put here for prototyping purposes. Should be moved to a users router
router.get('/feed', function(req, res, next) {

  //Checks user is authenticated.
  if (req.isAuthenticated()) {

    //Querries databasae for posts in descending date order. (feed will be chronological going down the page)
    db.query("SELECT id, title, html, created_on FROM posts ORDER BY created_on DESC;", [], function(err, result) {

      //Error handling for databasae connection. Re-routes user to index page
      if (err){
          req.flash('error_msg', 'Error when accessing database');
          res.redirect('/')

      //Renders feed page with results from query
      } else {
          res.render('feed', {title: 'Posts', results: result});
      }
    });

  //Redirects user to login page if not authenticated
  } else {
      req.flash('error_msg', 'You are not authenticated.');
      res.redirect("/admin/login");
  }
})


//Renders page to edit post with given ID
router.get('/:id', function (req, res, next) {
  var post_id = req.params.id;

  //Checks user is an admin. Only admins can access editing router
  if (req.isAuthenticated()) {

    //Query database for post with provided ID
    db.query("SELECT title, html FROM posts WHERE ? IN (id) LIMIT 1;", [post_id], function(err, result) {

      //Error handling for database connection. Reroutes user to posts index (most likely the origin)
      if (err) {
        req.flash('error_msg', 'Error connecteing with database');
        res.redirect('/edit');
      } else {

        //Checks if post with provided ID exists in the database. If true, then renders edit page
        if (result.length != 0) {
          res.render('text_editor', {title: 'Content Editor', postname:result[0].title, doc:result[0].html});

        //Redirects user to posts index if no post exists
        } else {
          req.flash('error_msg', 'No post with id: \'' + post_id + '\' in database');
          res.redirect('/edit');
        }
      }
    });

  //Redirects user to login page if not authenticated
  } else {
      req.flash('error_msg', 'You are not authenticated.');
      res.redirect("/admin/login");
  }

})


//UPDATE function
router.post('/:id', function (req, res, next) {
  const title = String(req.body.filename);
  const data = String(req.body.content);

  //Updates entry with provided ID in database with new title and data
  db.query("UPDATE posts SET title = ?, html = ? WHERE id = ?;", [title, data, req.params.id], function(err, result) {

      //Error handling for database connection. Redirects user to posts index
      if (err){
          req.flash('error_msg', 'Error when accessing database');
          res.redirect('/edit');

      //If update successful, redirects user to posts index
      } else {
          req.flash('success_msg', 'Post Successfully updated');
          res.redirect('/edit');
      }
  });
})

//DELETE Function
router.post('/delete/:id', function(req, res, next) {
  var id = req.params.id;

  //Idk why i added this ngl.
  if (id != null) {

    //Deletes entry with provided ID from database
    db.query("DELETE FROM posts WHERE id = ?;", [id], function(err, result) {

        //Error Handling for database connection. Redirects user to posts index
        if (err){
            req.flash('error_msg', 'Error when accessing database');
            res.redirect('/edit');

        //Redircts user to posts index if successful to show new change
        } else {
            req.flash('success_msg', 'Post Deleted');
            res.redirect('/edit');
        }
    });
  }
})



//edit, create, update, delete functions.

module.exports = router;
