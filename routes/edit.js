var express = require('express');
const db = require('../database.js');
var router = express.Router();

//Add admin login authentication check

//if /edit is used, then user is redirected to create a new edit section
router.get('/', function(req, res, next) {
    res.redirect('/edit/new');
});

router.get('/new', function (req, res, next) {
  res.render('text_editor', {title: 'Content Editor', postname:'', doc: null});
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



//// TODO: Create edit, create, update, delete functions.

module.exports = router;
