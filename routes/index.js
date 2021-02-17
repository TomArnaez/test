var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res) {
  getDatabaseVersion().then(function (result){
    res.render('index', { title: 'Express' , databaseVersion: result });
  });
});


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