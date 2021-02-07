var express = require('express');
var router = express.Router();

/* GET search results. */
router.get('/', function(req, res, next) {
    const searchQuery = req.query.q;
    if (searchQuery != null) {
        const db = require('../database.js');
        db.query("SELECT * FROM posts", function (err, result) {
            if (err) {
                console.log(err);
            } else {
                obj = {results: JSON.parse(JSON.stringify(result))};
                res.render('search', obj);
            }
        });
    } else {
        res.send("Bad one");
    }
});

module.exports = router;
