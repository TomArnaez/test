var express = require('express');
var router = express.Router();

const maybePluralize = (count, noun, suffix = 's') =>
    `${count} ${noun}${count !== 1 ? suffix : ''}`;

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
                const results = JSON.parse(JSON.stringify((result)));
                const resultsString = "" + maybePluralize(results.length, "result") + " for query: " + searchQuery;
                console.log(results);
                console.log(resultsString);
                const obj = {search: true, searchQuery: searchQuery, resultsString: resultsString, results: results};
                res.render('search', obj);
            }
        });
    } else {
        obj = {search: false}
        res.render('search', obj);
    }
});

module.exports = router;
