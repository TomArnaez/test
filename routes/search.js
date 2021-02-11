var express = require('express');
var router = express.Router();

/* GET search results. */
router.get('/', function(req, res, next) {
    const searchQuery = req.query.q;

    if (searchQuery != null) {
        const db = require('../database.js');
        const sql = "SELECT * FROM posts WHERE title LIKE '%" + searchQuery + "%'";
        db.query(sql, [searchQuery], function(err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
                obj = {search: true, searchQuery: searchQuery, results: JSON.parse(JSON.stringify(result))};
                res.render('search', obj);
            }
        });
    } else {
        obj = {search: false}
        res.render('search', obj);
    }

});

module.exports = router;
