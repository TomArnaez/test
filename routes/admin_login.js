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

router.get('/forgotpassword',(req,res)=>{
  res.render('forgotpassword-request');
})

router.get('/forgotpassword/:token',(req,res)=>{
  verifyJWTReset(req, res, function (req, res, token, decodedUserID) {
    res.render('forgotpassword-reset', { token: token });
  })
})

router.post('/forgotpassword/:token',(req,res)=> {
  verifyJWTReset(req, res, function (req, res, token, decodedUserID) {
    let newpass = req.body.newpass
    let passmatch = req.body.newpass == req.body.newpass2
    if(newpass == ""){
      req.flash('error_msg','Missing field.');
      res.redirect("/admin/forgotpassword/" + token);
    } else if(!passmatch){
      req.flash('error_msg','Passwords do not match.');
      res.redirect("/admin/forgotpassword/" + token);
    } else {
      bcrypt.hash(newpass, 10, function(err, newhash) {
        db.query("UPDATE users SET user_pass = ? WHERE id = ?;", [newhash, decodedUserID], function (err, result) {
          if (err) {
            req.flash('error_msg','No database connection.');
            res.redirect("/admin/forgotpassword/" + token);
          }
          req.flash('success_msg','Password updated! Please login:');
          res.redirect("/admin/login");
        });
      });
    }
  })
})

function verifyJWTReset(req, res, action){
  let token = req.params.token;
  if(token != ""){
    let jwt = require('jsonwebtoken');
    let decodedUserID = "";
    try {
      decodedUserID = jwt.decode(token).id
    }
    catch(err) {
      req.flash('error_msg','Invalid Token. Please try again.');
      res.redirect('/admin/forgotpassword');
      return;
    }
    db.query("SELECT id AS user_id, user_pass FROM users WHERE ? = id LIMIT 1;", [decodedUserID], function (err, result) {
      if (err) {
        req.flash('error_msg','No database connection.');
        res.redirect('/admin/forgotpassword');
      }
      if(result.length > 0) {
        jwt.verify(token, result[0].user_pass, function(err, decoded) {
          if (err) {
            req.flash('error_msg','Invalid Token. Please try again.');
            res.redirect('/admin/forgotpassword');
          } else {
            action(req, res, token, decodedUserID)
          }
        });
      } else {
        req.flash('error_msg','Invalid Token. Please try again.');
        res.redirect('/admin/forgotpassword');
      }
    });
  } else {
    res.redirect('/admin/forgotpassword');
  }
}

router.post('/forgotpassword',(req,res)=>{
  if(req.body.username != ""){
    db.query("SELECT id AS user_id, user_pass, user_email FROM users WHERE ? IN (user_login, user_email) LIMIT 1;", [req.body.username], function (err, result) {
      if (err) {
        req.flash('error_msg','No database connection.');
        res.redirect('/admin/forgotpassword');
      }
      if(result.length > 0) {
        let jwt = require('jsonwebtoken');
        let token = jwt.sign({
          id: result[0].user_id
        }, result[0].user_pass, { expiresIn: '24h' });

        //TODO: Here is where we should email the user their reset url
        console.log("Reset password for user '" + req.body.username + "' at [URL]/admin/forgotpassword/"+ token)

        req.flash('success_msg','Password reset email has been sent.');
        res.redirect('/admin/forgotpassword');
      } else {
        req.flash('error_msg','Invalid username or email.'); //do we really want to let a user know if a user exists/doesn't exist? Could send "If this user exists, a password reset has been sent" as same message as real user
        res.redirect('/admin/forgotpassword');
      }
    });
  } else {
    req.flash('error_msg','Enter a username or email address.');
    res.redirect('/admin/forgotpassword');
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