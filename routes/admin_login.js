var express = require('express');
var router = express.Router();

const passport = require('passport');

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