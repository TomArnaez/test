var express = require('express');
var router = express.Router();

// Example code to check user is authenticated. The logged in user id can be found in req.user. 
router.get('/', function(req, res, next) {
    if (req.isAuthenticated()) {
        res.render('admin_dashboard', { user_id: req.user });
    } else {
        req.flash('error_msg', 'You are not authenticated.');
        res.redirect("/admin/login");
    }
});

module.exports = router;