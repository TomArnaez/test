var express = require('express');
const db = require('../database.js');
var axios = require('axios');
const passport = require('passport');
var router = express.Router();


//Takes user to posts index page
router.get('/', function(req, res, next) {
  getUserPermission(req.user).then(function (permissions){

    //Checks user is an admin. Only admins can access editing router
    if (req.isAuthenticated()) {
      //Gets all posts in database
      db.query("SELECT * FROM posts;", [], function(err, result) {
        if (err){
            //error handling
            req.flash('error_msg', 'Error when accessing database');
            res.redirect('/')
        } else {
            res.render('posts_index', {title: 'Posts', results: result, messages: req.flash('error_msg'), active: 'view posts', permission: permissions[0].permission_level});
        }
      });
    } else {
        //Returns user to login
        req.flash('error_msg', 'You are not authenticated.');
        res.redirect("/admin/login");
    }
  });
});

//Renders page to view a post using the ID of the post
router.get('/view/:id', function (req, res, next) {
    getUserPermission(req.user).then(function (permissions) {

        var post_id = req.params.id;
        //Checks user is an admin. Only admins can access editing router
        if (req.isAuthenticated()) {
            // Send get request to API to get posts
            axios('http://localhost:3000/api/posts/' + post_id, {
                method: 'GET',
            }).then(results => {
                res.render('Post', {
                    title: 'Post Viewer',
                    id: post_id,
                    postname: results.data.title,
                    html: results.data.html,
                    description: results.data.description,
                    category_url: results.data.category_url,
                    category: results.data.category,
                    tags: results.data.tags,
                    user: results.data.user,
                    post: results.data
                });
            }).catch(error => {
                req.flash('error_msg', 'No post with id: \'' + post_id + '\' in database');
                res.redirect('/edit/');
            })
        } else {
            req.flash('error_msg', 'You are not authenticated.');
            res.redirect("/admin/login");
        }
    });
});

//Renders empty post editor to create a new post
router.get('/new', function (req, res, next) {
  getUserPermission(req.user).then(function (permissions){
    //Checks user is an admin. Only admins can access editing router
    if (req.isAuthenticated()) {
        res.render('text_editor', {title: 'Content Editor', postname:null, doc: null, back: '/edit/', active: 'create posts', permission: permissions[0].permission_level});

    //Redirects user to login page if they are not authenticated
    } else {
        req.flash('error_msg', 'You are not authenticated.');
        res.redirect("/admin/login");
    }
  });
});

//Saves post in database
router.post('/new', function (req, res) {

  //gets data from form posted
  const currentTime = getTime();
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
          db.query("INSERT INTO posts (title, html, last_modified, created_on, author_id) VALUES (?, ?, ?, ?, ?);", [title, data, currentTime, currentTime, user_id], function(err, result) {

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
  getUserPermission(req.user).then(function (permissions){

    //Checks user is an admin. Only admins can access editing router
    if (req.isAuthenticated()) {
        // Send get request to API to get post with provided iq
        axios('http://localhost:3000/api/posts/' + post_id, {
            method: 'GET',
        }).then(results => {
            res.render('text_editor', {title: 'Content Editor', postname:results.data.title, doc:results.data.html, posttags: results.data.tags,
                category_url: results.data.category_url, category: results.data.category, description: results.data.description,
                back: req.header('referer'), permission: permissions[0].permission_level});
            })
            .catch(err => {
                req.flash('error_msg', 'No post with id: \'' + post_id + '\' in database');
                res.redirect('/edit');
            });
      //Redirects user to login page if not authenticated
      } else {
          req.flash('error_msg', 'You are not authenticated.');
          res.redirect("/admin/login");
      }
  });
});

router.get('/hide/:post_id', function(req, res, next) {
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
  const currentTime = getTime();
  const title = String(req.body.filename);
  const data = String(req.body.content);
  const category = String(req.body.category);
  const description = String(req.body.description);
  const tagIds = String(req.body.tags).split(',');

    //Updates entry with provided ID in database with new title and data
    db.query("UPDATE posts SET title = ?, html = ?, last_modified = ? WHERE id = ?;", [title, data, currentTime, req.params.id], function(err, result) {

      //Error handling for database connection. Redirects user to posts index
      if (err){
          req.flash('error_msg', 'Error when updating post: ' + err);
          res.redirect('/edit');

      //If update successful, redirects user to posts index

      } else {
          // Update and the associations with categories and tags.
          const err = updateAssociations(req.params.id, category, tagIds)
          if(err != null) {
              req.flash('error_msg', 'Error while updating tags and category associations: ' + err);
          } else {
              req.flash('success_msg', 'Post Successfully updated');
          }
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
function process(userID, callback){
  getUserPermission(function (err, data) {
    db.query("SELECT * FROM users WHERE id = ?",[userID], (err, result)=> {
        if(err) throw err
        if(result.length > 0)
        return callback(result);
        else return callback(0);
    });
  });
}

module.exports = router;

function getUserPermission(userID){
  return new Promise((resolve,reject)=>{
    db.query("SELECT * FROM users WHERE id = ?",[userID], (err, result)=> {
        if(err) throw err
        if(result.length > 0)
        resolve(result);
        else resolve(null);

    });
  });
}

function getTime() {
    const date = new Date();
    return date.getFullYear()
            + '-' +
            date.getMonth()
            + '-' +
            date.getDate()
            + ' ' +
            date.getHours()
            + ':' +
            date.getMinutes()
            + ':' +
            date.getSeconds();

}

function updateAssociations(postId, newCategory, newTagIds) {
    const seq = require("../models");

    seq.Post.findOne({where: {id: postId}, include: { model: seq.Term, as: "terms"}})
        .then(post => {
            if (post.category_id != newCategory) {
                db.query("UPDATE postTerms set termId = ? WHERE postId = ? AND termId = ?;",
                    [newCategory, post.id, post.category_id], function (err, result) {
                        if (err)
                            return err;
                    })
            }

            // UPDATE tags
            post.tags.forEach(tag => {
                db.query("DELETE FROM postTerms where postId = ? AND termId = ?;", [postId, tag.id], function(err, result) {
                    if (err)
                        return err;
                })
            })
            newTagIds.forEach(tag => {
                db.query("INSERT INTO postTerms (postId, termId) VALUES (?, ?);", [postId, tag], function(err, result) {
                    if (err)
                        return err;
                })
            })
        }).catch(err => {
        return err
    })

    return null;
}
