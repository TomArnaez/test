var express = require('express');
var router = express.Router();

const passport = require('passport');
const db = require('../database.js');
const bcrypt = require('bcrypt');

router.get('/', function(req, res, next) {
  if(req.isAuthenticated()){
    res.redirect("/admin/dashboard");
  } else {
    req.flash('error_msg','You are not authenticated.');
    res.redirect("/admin/login");
  }
});

router.get('/login',(req,res)=>{
  if(req.isAuthenticated()){
    res.redirect("/admin/dashboard");
  } else {
    res.render('login');
  }
})

router.get('/register',(req,res)=>{
  req.flash('error_msg','You can not register.');
  res.redirect('/admin/login');
})

router.post('/login',(req,res,next)=>{
    passport.authenticate('local',{
      successRedirect : '/admin/dashboard',
      failureRedirect : '/admin/login',
      failureFlash : true
    })(req,res,next);
})

router.get('/changepassword',(req,res)=>{
  if(req.isAuthenticated()){
    res.render('changepassword');
  } else {
    req.flash('error_msg','You are not authenticated.');
    res.redirect("/admin/login");
  }
})

router.post('/changepassword',(req,res,next)=>{
  if(req.isAuthenticated()){
    let oldpass = req.body.oldpass
    let newpass = req.body.newpass
    let passmatch = req.body.newpass == req.body.newpass2
    if(oldpass == "" || newpass == ""){
      req.flash('error_msg','Missing field.');
      res.redirect("/admin/changepassword");
    } else if(!passmatch){
      req.flash('error_msg','Passwords do not match.');
      res.redirect("/admin/changepassword");
    } else {
      db.query("SELECT id AS user_id, user_pass FROM users WHERE ? = id LIMIT 1;", [req.user], function (err, result) {
        if (err) {
          req.flash('error_msg','No database connection.');
          res.redirect("/admin/changepassword");
        }
        bcrypt.compare(oldpass, result[0].user_pass, function (err, hashMatched) {
          if(hashMatched){
            bcrypt.hash(newpass, 10, function(err, newhash) {
              db.query("UPDATE users SET user_pass = ? WHERE id = ?;", [newhash, req.user], function (err, result) {
                if (err) {
                  req.flash('error_msg','No database connection.');
                  res.redirect("/admin/changepassword");
                }
                req.flash('success_msg','Password updated!');
                res.redirect("/admin/changepassword");
              });
            });
          } else {
            req.flash('error_msg','Incorrect password.');
            res.redirect("/admin/changepassword");
          }
        })
      });
    }
  } else {
    req.flash('error_msg','You are not authenticated.');
    res.redirect("/admin/login");
  }
})

router.post('/register',(req,res)=>{
  req.flash('error_msg','You can not register.');
  res.redirect('/admin/login');
})

router.get('/logout',(req,res)=>{
  req.logout();
  req.flash('success_msg','You have been logged out.');
  res.redirect('/admin/login');
})

module.exports = router;