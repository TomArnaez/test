var express = require('express');
const db = require('../database.js');
var axios = require('axios');
const passport = require('passport');
var router = express.Router();

//Takes user to posts index page
router.get('/', function(req, res, next) {
  if (req.isAuthenticated()) {
    getUserPermission(req.user).then(function (permissions){
      let perm_level = permissions[0].permission_level;
      if (perm_level >= 2) {
        //Checks user is an admin. Only admins can access editing router

          //Gets all posts in database
          db.query("SELECT * FROM posts;", [], function(err, result) {
            if (err){
                //error handling
                req.flash('error_msg', 'Error when accessing database');
                res.redirect('/')
            } else {
                res.render('posts_index', {title: 'Posts', results: result, messages: req.flash('error_msg'), active: 'view posts', permission: perm_level});
            }
          });

      } else {
        req.flash('error_msg', 'You are not Authorised to access this section.');
        res.redirect("/");
      }
    });
  } else {
      //Returns user to login
      req.flash('error_msg', 'You are not logged in.');
      res.redirect("/admin/login");
  }
});

//Renders page to view a post using the ID of the post
router.get('/view/:id', function (req, res, next) {
    if (req.isAuthenticated()) {
        getUserPermission(req.user).then(function (permissions) {
            let perm_level = permissions[0].permission_level;
            var post_id = req.params.id;
            //Checks user is an admin. Only admins can access editing router

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
        });
            //Redirects user to login page if they are not logged in
        } else {
            req.flash('error_msg', 'You are not authenticated.');
            res.redirect("/admin/login");
        }
});

//Renders empty post editor to create a new post
router.get('/new', function (req, res, next) {
  getUserPermission(req.user).then(function (permissions){
    //Checks user is an admin. Only admins can access editing router
    if (req.isAuthenticated()) {
        res.render('text_editor', {title: 'Content Editor', postname:null, doc: null, posttags: [], back: '/edit/', active: 'create posts', permission: permissions[0].permission_level});

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
  const tagIds = String(req.body.tags).split(',');

  //Inserts new post into database
  axios('http://localhost:3000/api/posts', {
    method: 'POST',
    data: {title: title, html: data, description: description, created_on: currentTime, author_id: user_id, category: category, tags: tagIds}
    })
    .then(result => {
      const newPostID = result.insertId;
      req.flash('success_msg', 'Successfully saved post to database');
      res.redirect('/edit');
    }).catch(err => {

    //checks that file with same title doesn't already exist in database, throws error if true and returns user to index
    req.flash('error_msg', 'Error connecting to database: ' + err);
      res.render('text_editor', {
        title: 'Content Editor',
        postname: title,
        description: description,
        doc: data,
        messages: req.flash('error_msg')
      });
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
                category_url: results.data.category_url, category_id: results.data.category_id, description: results.data.description,
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
  axios('http://localhost:3000/api/posts', {
    method: 'PUT',
    data: {id: req.params.id, title: title, html: data, description: description, last_modified: currentTime, category: category, tags: tagIds}
    }).then(response => {
      //If update successful, redirects user to posts index
      req.flash('success_msg', 'Post Successfully updated');
      res.redirect('/edit');
    })
      .catch(err => {
        req.flash('error_msg', 'Error when updating post: ' + err);
        res.redirect('/edit');
      });
})

//DELETE Function
router.get('/delete/:id', function(req, res, next) {
  var id = req.params.id;
  //Idk why i added this ngl.
  if (id != null) {

    //Deletes entry with provided ID from database
    //This should delete associations with categories and tags due to constraint in the database.
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
