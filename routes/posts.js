var express = require('express');
var router = express.Router();

/* GET post */
router.get('/:slug/:id', function(req, res, next) {
    const http = require('http')
    http.get("http://localhost:3000/api/posts/" + req.params.id, (resp) => {
        let data = ""

        resp.on("data", d => {
            data += d
        });

        resp.on("end", () => {
            const json = JSON.parse(data)
            console.log(json);
            const obj = { html: json.html};
            res.render('post', obj);
        });
    });
});

module.exports = router;