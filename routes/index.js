var express = require('express');
const db = require('../database.js');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  getDatabaseVersion().then(function (result){
    res.render('index', { title: 'Express' , databaseVersion: result });
  });
});

router.get('/info', function(req, res, next) {

  res.render('info_page', { title: 'About Us', active: 'about'});

});

// Fetches main feed page
router.get('/feed', function(req, res, next) {

  //Checks user is authenticated.
  if (req.isAuthenticated()) {

    //Querries databasae for posts in descending date order. (feed will be chronological going down the page)
    db.query("SELECT * FROM posts JOIN users ON posts.author_id = users.id ORDER BY posts.created_on DESC;", [], function(err, result) {

      //Error handling for databasae connection. Re-routes user to index page
      if (err){
          req.flash('error_msg', 'Error when accessing database');
          res.redirect('/')

      //Renders feed page with results from query
      } else {
          res.render('feed', {title: 'Posts', results: result, active: 'feed'});
      }
    });

  //Redirects user to login page if not authenticated
  } else {
      req.flash('error_msg', 'You are not authenticated.');
      res.redirect("/admin/login");
  }
})

router.get('/author/:id', function(req, res, next) {
  //Checks user is authenticated.
  if (req.isAuthenticated()) {

    db.query("SELECT * FROM users WHERE ? IN (id);", [req.params.id], function(err, result) {

      //Error handling for databasae connection. Re-routes user to index page
      if (err){
          req.flash('error_msg', 'Error when accessing database');
          res.redirect('/')

      } else {
        res.render('author_info', {title: 'Author Information', results: result, back:req.header('Referer')})
      }
    });

  } else {
    req.flash('error_msg', 'You are not authenticated.');
    res.redirect("/admin/login");
  }
})

module.exports = router;

function getDatabaseVersion() {
  var db = require('../database.js');
  return new Promise(function (resolve, reject){
    db.query("SELECT VERSION() as VER", function (err, result) {
      if (err) reject(err);
      resolve(result[0].VER);
    });
  });
}
