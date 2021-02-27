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
            let json = JSON.parse(data)

            // Replace the line breaks added (potentially) by tinymce
            json.html = json.html.replace("/n", "<br>");
            console.log(json);
            const obj = { html: json.html, created_on: json.created_on, last_modified: json.last_modified};
            res.render('post', obj);
        });
    });
});

module.exports = router;