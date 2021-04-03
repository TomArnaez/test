var express = require('express');
var router = express.Router();
const db = require('../database.js');

// Example code to check user is authenticated. The logged in user id can be found in req.user.
router.get('/profile', function(req, res, next) {
    if (req.isAuthenticated()) {
        db.query("SELECT id user_email, user_login, user_fname, user_lname FROM users WHERE id = ? ;", [req.user_id], function(err, result) {
            if (err) {
                //error handling
                req.flash('error_msg', 'Error when accessing database');
                res.redirect('/')
            } else {
                res.render('profile', { result });
            }
        });
    } else {
        req.flash('error_msg', 'You are not authenticated.');
        res.redirect("/admin/login");
    }
});

module.exports = router;