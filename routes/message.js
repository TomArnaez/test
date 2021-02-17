const express = require('express');
const router = express.Router();


/* GET Contact page. */
router.get('/message', function(req, res) {
    res.render('message');
});

module.exports = router;