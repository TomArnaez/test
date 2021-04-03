var express = require('express');
var router = express.Router();

// Example code to check user is authenticated. The logged in user id can be found in req.user.
router.get('/', function(req, res, next) {
    if (req.isAuthenticated()) {
        res.render('admin_categories', { user_id: req.user });
    } else {
        req.flash('error_msg', 'You are not authenticated.');
        res.redirect("/admin/login");
    }
});

router.post('/', function(req, res, next) {
    const termName = String(req.body.termName);
    const termSlug = String(req.body.termSlug);
    const description = String(req.body.description);

    console.log(req.body);

    res.render('admin_categories', { user_id: req.user });
});

module.exports = router;