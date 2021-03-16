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
                            console.log(json);
                            json.posts = json.posts.filter(post => post.terms[0].termSlug == req.params.category);
                            json.found = true;
                            json.categoryName = token.termName;
                            // Don't zero index
                            json.currentPage = json.currentPage + 1;

                            res.render('category', json);
                        });
                    });
                }
            }
        );
});

router.get("/tag/:tag", function(req, res, next){
    const db = require("../models");
    const Term = db.Term;
    Term.findOne({where: {termSlug: req.params.tag, termType: "tag"}})
        .then(token => {
            if (token === null) {
                console.log("Tag not found.");
                res.render('category', {found: false});
            } else {
                console.log("Found");
                res.render('category', {found: false});
            }
        })
})
/* GET post */
router.get('/:category/:id/:slug', function(req, res, next) {
    const http = require('http')
    http.get("http://localhost:3000/api/posts/" + req.params.id, (resp) => {
        let data = ""

        resp.on("data", d => {
            data += d
        });

        resp.on("end", () => {
            let json = JSON.parse(data)
            console.log(json)
            console.log("HEEEY");

            // Replace the line breaks added (potentially) by tinymce
            //json.html = json.html.replace("/n", "<br>");
            res.render('post', json);
        });
    });
});

module.exports = router;