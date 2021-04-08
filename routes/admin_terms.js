var express = require('express');
var axios = require('axios');
var router = express.Router();
const db = require("../models");
const Term = db.Term;
const Post = db.Post;

// Example code to check user is authenticated. The logged in user id can be found in req.user.
router.get('/', function(req, res, next) {

    if (req.isAuthenticated()) {
        axios('http://localhost:3000/api/terms/', {
            method: 'GET',
        }).then(results => {
            res.render('admin_terms', {terms: results.data, active: 'term manager'})
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
    const params = {
        termName: String(req.body.termName),
        termSlug: String(req.body.termSlug).toLowerCase(),
        description: String(req.body.description),
        termType: String(req.body.termType).toLowerCase()
    }

    axios('http://localhost:3000/api/terms', {
        method: 'POST',
        data: params
        })
        .then(newTerm => {
            req.flash('success_msg', 'New Term added');
            res.redirect('/admin/terms');
        }).catch(err => {
            req.flash("error_msg", "Error adding term: ", err)
            res.redirect('/admin/terms');
    });

});

module.exports = router;