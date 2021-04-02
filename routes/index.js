var express = require('express');
const db = require('../database.js');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  getDatabaseVersion().then(function (result){
    res.render('index', { title: 'Express' , databaseVersion: result });
  });
});


// Fetches main feed page
router.get('/feed', function(req, res, next) {

  //Checks user is authenticated.
  if (req.isAuthenticated()) {
    const db = require("../models");
    const Post = db.Post;
    const Term = db.Term;

    Post.findAll({ include: { model: Term, as: "terms"}, order: [['created_on', 'DESC']]})
      .then(data => {
          res.render('feed', {title: 'Posts', results: data});
      })
      .catch(err => {
          req.flash('error_msg', 'Error when accessing database');
          res.redirect('/')
      });
  //Redirects user to login page if not authenticated
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
