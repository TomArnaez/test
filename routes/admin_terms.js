var express = require('express');
var router = express.Router();
const db = require("../models");
const Term = db.Term;
const Post = db.Post;

// Example code to check user is authenticated. The logged in user id can be found in req.user.
router.get('/', function(req, res, next) {
    if (req.isAuthenticated()) {
        Term.findAll({ where: {}, include: { model: Post, as: "posts", attributes: ['id']} })
            .then(results => {
                res.render('admin_terms', {terms: results});
            })
            .catch(err => {
                req.flash("error_msg", err);
                res.render('admin_terms');
            })
    } else {
        req.flash('error_msg', 'You are not authenticated.');
        res.redirect("/admin/login");
    }
});

router.post('/', function (req, res, next) {
    const termName = String(req.body.termName);
    const termSlug = String(req.body.termSlug);
    const description = String(req.body.description);
    const termType = String(req.body.termType);
    console.log(termType);

    Term.create({termType: termType, termName: termName, termSlug: termSlug, description: description
        }).then(newCategory=> {
            req.flash('error_msg', 'New Term added');
        }).catch(err => {
            console.log(err);
            req.flash("error_msg", err)
    });
    req.flash('error_msg', 'New Term added');
    res.render('admin_terms');
});

module.exports = router;