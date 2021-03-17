var express = require('express');
var router = express.Router();

router.get('/:category', function(req, res, next) {
    const db = require("../models");
    const Term = db.Term;
    let page = req.query.page;
    if (page == null)
        page = 0;

    //http.get("http://localhost:3000/api/posts?page=" + page + "&size=3&title=" + title, (resp) => {
    Term.findOne({where: {termSlug: req.params.category, termType: "category"}})
            .then(token => {
                if (token === null) {
                    res.render('category', {found: false});
                } else {
                    console.log("Found");
                    const http = require('http')
                    http.get("http://localhost:3000/api/posts?category=" + req.params.category + "&page=" + page, (resp) => {
                        let data = "";
                        resp.on("data", d => {
                            data += d
                        });
                        resp.on("end", () => {
                            let json = JSON.parse(data);
                            json.posts = json.posts.filter(post => post.terms[0].termSlug == req.params.category);
                            json.found = true;
                            json.categoryName = token.termName;
                            // Don't zero index
                            json.currentPage = json.currentPage + 1;
                            json.next_page = "/posts/" + req.params.category + "?page=" + (parseInt(page) + 1);
                            json.prev_page = "/posts/" + req.params.category + "?page=" + (parseInt(page) - 1);
                            res.render('category', json);
                        });
                    });
                }
            }
        );
});

router.get("/tags/:tag", function(req, res, next) {
    const db = require("../models");
    const Term = db.Term;
    let page = req.query.page;

    if (page == null)
        page = 0;
    Term.findOne({where: {termSlug: req.params.tag, termType: "tag"}})
        .then(token => {
            if (token === null) {
                res.render('category', {found: false});
            } else {
                const http = require('http')
                http.get("http://localhost:3000/api/posts?tag=" + req.params.tag + "&page=" + page, (resp) => {
                    let data = "";
                    resp.on("data", d => {
                        data += d
                    });
                    resp.on("end", () => {
                        let json = JSON.parse(data);
                        json.found = true;
                        json.categoryName = token.termName;
                        // Don't zero index
                        json.currentPage = json.currentPage + 1;
                        json.next_page = "/posts/tags/" + req.params.tag + "?page=" + (parseInt(page) + 1);
                        json.prev_page = "/posts/tags/" + req.params.tag + "?page=" + (parseInt(page) - 1);
                        res.render('category', json);
                    });
                });
            }
        })
});
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
            // Replace the line breaks added (potentially) by tinymce
            //json.html = json.html.replace("/n", "<br>");
            res.render('post', json);
        });
    });
});

module.exports = router;