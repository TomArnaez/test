var express = require('express');
var router = express.Router();

// Example code to check user is authenticated. The logged in user id can be found in req.user.
router.get('/', function(req, res, next) {
    if (req.isAuthenticated()) {
        res.render('admin_categories');
    } else {
        req.flash('error_msg', 'You are not authenticated.');
        res.redirect("/admin/login");
    }
});

router.post('/', function (req, res, next) {
    const termName = String(req.body.termName);
    const termSlug = String(req.body.termSlug);
    const description = String(req.body.description);
    const db = require("../models");
    const Term = db.Term;
    Term.create({termName: termName, termSlug: termSlug, termType: "category", description: description
        }).then(newCategory=> {
            console.log(newCategory);
            req.flash('error_msg', 'New category added');
        }).catch(err => {
            console.log(err);
            req.flash("error_msg", err)
    });
    req.flash('error_msg', 'New category added');
    res.render('admin_categories');
});

module.exports = router;