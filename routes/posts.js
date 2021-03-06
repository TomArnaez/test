var express = require('express');
var router = express.Router();

router.get('/:category', function(req, res, next) {
    const db = require("../models");
    const Term = db.Term;
    Term.findOne({where: {termSlug: req.params.category, termType: "category"}})
            .then(token => {
                if (token === null) {
                    console.log("Category not found.");
                    res.render('category', {found: false});
                } else {
                    console.log("Found");
                    const http = require('http')
                    http.get("http://localhost:3000/api/posts?category=" + req.params.category, (resp) => {
                        let data = "";
                        resp.on("data", d => {
                            data += d
                        });
                        resp.on("end", () => {
                            let json = JSON.parse(data);
                            //console.log(json);
                            //console.log(json.posts[0].terms)
                            json.posts = json.posts.filter(post => post.terms[0].termSlug == req.params.category);
                            json.found = true;
                            json.categoryName = token.termName;
                            // Don't zero index
                            json.currentPage = json.currentPage + 1;
                            json.posts.forEach(post => {
                                let category = post["terms"][0]["termSlug"];
                                post['category_url'] = post.terms[0].url;
                            });
                            res.render('category', json);
                        });
                    });
                }
            }
        );
});

/* GET post */
router.get('/:category/:id/:slug', function(req, res, next) {
    const http = require('http')
    http.get("http://localhost:3000/api/posts/" + req.params.id, (resp) => {
        let data = ""

        resp.on("data", d => {
            data += d
        });

        console.log(data);

        resp.on("end", () => {
            let json = JSON.parse(data)
            console.log(json['terms'])

            // Replace the line breaks added (potentially) by tinymce
            //json.html = json.html.replace("/n", "<br>");
            console.log(json);
            const obj = { html: json.html, created_on: json.created_on, last_modified: json.last_modified};
            res.render('post', obj);
        });
    });
});

module.exports = router;