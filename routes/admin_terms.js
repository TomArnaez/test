var express = require('express');
var axios = require('axios');
var router = express.Router();
const db = require("../database");

// Example code to check user is authenticated. The logged in user id can be found in req.user.
router.get('/', async (req, res, next) => {

    if (req.isAuthenticated()) {
        var permissions = await getUserPermission(req.user);
        axios('http://localhost:3000/api/terms/', {
            method: 'GET',
        }).then(results => {
            res.render('admin_terms', {terms: results.data, active: 'term manager', permission: permissions[0].permission_level})
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

function getUserPermission(userID){
    return new Promise((resolve,reject)=>{
        db.query("SELECT * FROM users WHERE id = ?",[userID], (err, result)=> {
            if(err) throw err
            if(result.length > 0)
                resolve(result);
            else resolve(null);

        });
    });
}

module.exports = router;