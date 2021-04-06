var express = require('express');
const db = require('../database.js');
const passport = require('passport');
var router = express.Router();


//Takes user to posts index page
router.get('/', function(req, res, next) {
  //Checks user is an admin. Only admins can access editing router
  if (req.isAuthenticated()) {
    //Gets all posts in database
    db.query("SELECT * FROM posts;", [], function(err, result) {
      if (err){
          //error handling
          req.flash('error_msg', 'Error when accessing database');
          res.redirect('/')
      } else {
          res.render('posts_index', {title: 'Posts', results: result, messages: req.flash('error_msg'), active: 'view posts'});
      }
    });
  } else {
      //Returns user to login
      req.flash('error_msg', 'You are not authenticated.');
      res.redirect("/admin/login");
  }
});

//Renders page to view a post using the ID of the post
router.get('/view/:id', async (req, res, next) => {
  var post_id = req.params.id;

  //Checks user is an admin. Only admins can access editing router
  if (req.isAuthenticated()) {
      const db = require("../models");
      const post = await db.Post.findOne({where: {id: post_id}, include: { model: db.Term, as: "terms"}})
      const user = await db.User.findOne({where: {id: post.author_id}});

      if (post != null) {
        res.render('Post', {title: 'Post Viewer', id: post_id, postname: post.title, doc: post.html, description: post.description,
            category_url: post.category_url, category: post.category, tags: post.tags, user: user, post:post});
      } else {
        req.flash('error_msg', 'No post with id: \'' + post_id + '\' in database');
        res.redirect('/edit/');
      }
    //Query to get the post from the database
    /*
    db.query("SELECT title, html FROM posts WHERE ? IN (id) LIMIT 1;", [post_id], function(err, result) {

      //error handling for database errors
      if (err) {
        req.flash('error_msg', 'Error connecteing with database')
        res.redirect('/edit/');
<<<<<<< HEAD
=======
      } else {

        //Checks a post with the ID Exists and renders a page with the post
        if (result.length != 0) {
          res.render('Post', {title: 'Post Viewer', id:post_id, postname:result[0].title, doc:result[0].html, active: 'posts'});

        //Redirects user to Posts index if no post exists in the data base with the provided ID
        } else {
          req.flash('error_msg', 'No post with id: \'' + post_id + '\' in database');
          res.redirect('/edit/');
        }
>>>>>>> master
      }
    });
    */
  } else {
      req.flash('error_msg', 'You are not authenticated.');
      res.redirect("/admin/login");
  }

});

router.get('/view/title/:title', function (req, res, next) {
  var post_title = req.params.title;

  //Checks user is an admin. Only admins can access editing router
  if (req.isAuthenticated()) {

    //Query to get the post from the database
    db.query("SELECT title, html FROM posts WHERE ? IN (title) LIMIT 1;", [post_title], function(err, result) {

      //error handling for database errors
      if (err) {
        req.flash('error_msg', 'Error connecteing with database')
        res.redirect('/edit/');
      } else {

        //Checks a post with the ID Exists and renders a page with the post
        if (result.length != 0) {
          res.render('Post', {title: 'Post Viewer', id:post_title, postname:result[0].title, doc:result[0].html,});

        //Redirects user to Posts index if no post exists in the data base with the provided ID
        } else {
          req.flash('error_msg', 'No post with title: \'' + post_title + '\' in database');
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
      res.render('text_editor', {title: 'Content Editor', postname:null, doc: null, back: '/edit/', active: 'create posts'});

  //Redirects user to login page if they are not authenticated
  } else {
      req.flash('error_msg', 'You are not authenticated.');
      res.redirect("/admin/login");
  }
})

//Saves post in database
router.post('/new', function (req, res) {

  //gets data from form posted
  const user_id = req.user;
  //gets data from form posted.
  const title = String(req.body.filename);
  const data = String(req.body.content);
  const category = String(req.body.category);
  const description = String(req.body.description);
  const tags = String(req.body.tags).split(',');
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
          res.render('text_editor', {
              title: 'Content Editor',
              postname: title,
              description: description,
              doc: data,
              messages: req.flash('error_msg')
          });

          //Inserts new post into database
      } else {
          db.query("INSERT INTO posts (title, html, description, author_id) VALUES (?, ?, ?, ?);", [title, data, description, user_id], function(err, result) {

              //Error handling for database connection
              if (err) {
                  req.flash('error_msg', 'Error connecting to database: ' + err);
                  res.render('text_editor', {
                      title: 'Content Editor',
                      postname: title,
                      description: description,
                      doc: data,
                      messages: req.flash('error_msg')
                  });

                  // If post inserted successfully, we add the category association and redirect.
              } else {
                  const newPostID = result.insertId;
                  req.flash('success_msg', 'Successfully saved post to database');
                  db.query("INSERT INTO postTerms (postId, termId) VALUES (?, ?);", [newPostID, category], function (err, result) {
                      if (err) {
                          req.flash('error_msg', 'Error connecting to database while adding category association: ' + err);
                          res.render('text_editor', {
                              title: 'Content Editor',
                              postname: title,
                              description: description,
                              doc: data,
                              messages: req.flash('error_msg')
                          });
                      } else {
                          tags.forEach(tag => {// Need to add error checking
                              db.query("INSERT INTO postTerms (postId, termId) VALUES (?, ?);", [newPostID, tag], function (err, res) {
                                  if (err)
                                    console.log(err);
                              });
                          });
                          res.redirect('/edit');
                      }
                  });
              }
          });
      }
  });
})

//Renders page to edit post with given ID
router.get('/:id', function (req, res, next) {
  var post_id = req.params.id;
  const db = require("../models");
  const Term = db.Term;
  const Post = db.Post;

  //Checks user is an admin. Only admins can access editing router
  if (req.isAuthenticated()) {

  //Query database for post with provided ID
  Post.findOne({where: {id: post_id}, include: { model: db.Term, as: "terms"}})
      .then(post => {
          if (post != null) {
              res.render('text_editor', {postname:post.title, doc:post.html, posttags: post.tags,
                  category_id: post.category_id, description: post.description, back: '/edit/', messages: req.flash()});
          } else {
              req.flash('error_msg', 'No post with id: \'' + post_id + '\' in database');
              res.redirect('/edit');
          };
      })
      .catch(err => {
          req.flash('error_msg', 'Error connecteing with database');
          res.redirect('/edit');
      })

  //Redirects user to login page if not authenticated
  } else {
      req.flash('error_msg', 'You are not authenticated.');
      res.redirect("/admin/login");
  }

})

router.get('/hide/:post_id', function(req, res, next) {
  console.log("m8");
  db.query("UPDATE posts SET visible = ? WHERE id = ?;", [0, req.params.post_id], function(err, result) {
    if (err){
      req.flash('error_msg', 'Error when accessing database');
      console.log('failed: ' + err);
      res.redirect(req.get('referer'));
    //If update successful, redirects user to posts index
    } else {
      console.log('success');
      req.flash('success_msg', 'Successfully updated post');
      res.redirect(req.get('referer'));
    }
  });
})

router.post('/show/:post_id', function(req, res, next) {
  db.query("UPDATE posts SET visible = ? WHERE id = ?;", [1, req.params.post_id], function(err, result) {
    if (err){
      req.flash('error_msg', 'Error when accessing database');
      console.log('failed: ' + err);
      res.redirect(req.get('referer'));
    //If update successful, redirects user to posts index
    } else {
      console.log('success');
      req.flash('success_msg', 'Successfully updated post');
      res.redirect(req.get('referer'));
    }
  });
})

//UPDATE function
router.post('/:id', function (req, res, next) {
  const title = String(req.body.filename);
  const data = String(req.body.content);
  const category = String(req.body.category);
  const description = String(req.body.description);
  const tags = String(req.body.tags);

  //Updates entry with provided ID in database with new title and data
    db.query("UPDATE posts SET title = ?, html = ?, description = ? WHERE id = ?; " +
        "UPDATE postTerms set termId = ? WHERE postId = ?;",
      [title, data, description, req.params.id, category, req.params.id], function(err, result) {

      //Error handling for database connection. Redirects user to posts index
      if (err){
          req.flash('error_msg', 'Error when accessing database: ' + err);
          res.redirect('/edit');

      //If update successful, redirects user to posts index
      } else {

          tags.forEach(tag => {
              db.query("DELETE FROM postTerms WHERE postId = ? AND termId != ?", [req.params.id, category], function(err, result) {
                  if (err) {
                      console.log(err);
                  }
                  console.log(result);
              });
              db.query("INSERT into postTerms (postId, termId) VALUES (?, ?) ON DUPLICATE KEY UPDATE postId=postId termId=termId", [tag, req.params.id], function(err, result) {
                  if (err) {
                      console.log(err);
                    }
              })
          });
          req.flash('success_msg', 'Post Successfully updated');
          res.redirect('/edit');
      }
  });

})

//DELETE Function
router.get('/delete/:id', function(req, res, next) {
  var id = req.params.id;
  //Idk why i added this ngl.
  if (id != null) {

    //Deletes entry with provided ID from database
    db.query("DELETE FROM posts WHERE id = ?;", [id], function(err, result) {

        //Error Handling for database connection. Redirects user to posts index
        if (err){
            console.log("ehhh");
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
