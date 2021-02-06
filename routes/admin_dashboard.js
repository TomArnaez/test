var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    if(req.isAuthenticated()){
        res.render('admin_dashboard', { user_id: req.user });
    } else {
        req.flash('error_msg','You are not authenticated.');
        res.redirect("/admin/login");
    }
});

module.exports = router;