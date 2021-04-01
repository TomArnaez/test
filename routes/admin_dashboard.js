var express = require('express');
var router = express.Router();

const db = require('../database.js');

// Example code to check user is authenticated. The logged in user id can be found in req.user.
router.get('/', function(req, res, next) {
    if (req.isAuthenticated()) {
        res.render('admin_dashboard', { user_id: req.user });
    } else {
        req.flash('error_msg', 'You are not authenticated.');
        res.redirect("/admin/login");
    }
});

// Test code to generate user invite token, puts it in userid field on site
router.get('/inviteusers', function(req, res, next) {
    if (true) {
        genUniqueCode(8).then(function (result){
            res.render('admin_dashboard', { user_id: result });
        })
    } else {
        req.flash('error_msg', 'You are not authenticated.');
        res.redirect("/admin/login");
    }
});

async function genUniqueCode(length) {
    let charset = "BCDFGHJKMPQRTVWXY346789";
    let s = [...Array(length)].reduce(a => a + charset[~~(Math.random() * charset.length)], "");
    let com2charseq = "th,ar,he,te,an,se,in,me,er,sa,nd,ne,re,wa,ed,ve,es,le,ou,no,to,ta,ha,al,en,de,ea,ot,st,so,nt,dt,on,ll,at,tt,hi,el,as,ro,it,ad,ng,di,is,ew,or,ra,et,ri,of,sh,ti,ck,kk".split(",");
    s = com2charseq.some(a => s.includes(a)) ? await genUniqueCode(length) : s
    return await doesTokenAlreadyExist(s) ? await genUniqueCode(length) : s
}

function doesTokenAlreadyExist(token) {
    return new Promise(function (resolve, reject) {
        db.query("SELECT * FROM registration_codes WHERE code = ?;", [token], function (err, result) {
            if (err) {
                reject("No database connection.");
            } else {
                if (result.length > 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }
        });
    });
}

module.exports = router;