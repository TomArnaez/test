var express = require('express');
var router = express.Router();
const db = require("../models");
const Term = db.Term;
const Post = db.Post;

router.get('/category/:category', function(req, res, next) {
    let page = req.query.page;
    if (page == null)
        page = 0;

    Term.findOne({where: {termSlug: req.params.category, termType: "category"}})
            .then(token => {
                if (token === null) {
                    res.render('category', {found: false});
                } else {
                    const http = require('http')

                    http.get("http://localhost:3000/api/posts?category=" + req.params.category + "&page=" + page, (resp) => {
                        let data = "";
                        resp.on("data", d => {
                            data += d
                        });
                        resp.on("end", () => {
                            let json = JSON.parse(data);
                            json.posts = json.posts.filter(post => post.terms[0].termSlug == req.params.category);
                            console.log(json);
                            json.found = true;
                            json.categoryName = token.termName;
                            /*
                            // Don't zero index
                            json.currentPage = json.currentPage + 1;
                            json.next_page = "/posts/" + req.params.category + "?page=" + (parseInt(page) + 1);
                            json.prev_page = "/posts/" + req.params.category + "?page=" + (parseInt(page) - 1);

                             */
                            res.render('category', json);
                        });
                    });
                }
            }
        );
});

router.get("/tag/:tag", function(req, res, next) {
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
                        json.next_page = "/posts/tag/" + req.params.tag + "?page=" + (parseInt(page) + 1);
                        json.prev_page = "/posts/tag/" + req.params.tag + "?page=" + (parseInt(page) - 1);
                        res.render('category', json);
                    });
                });
            }
        })
});
/* GET post */
router.get('/:category/:id/:slug', async(req, res, next) => {
    const post_id = req.params.id;

    //Checks user is an admin. Only admins can access editing router
    if (req.isAuthenticated()) {
        const db = require("../models");
        const post = await db.Post.findOne({where: {id: post_id}, include: { model: db.Term, as: "terms"}})
        const user = await db.User.findOne({where: {id: post.author_id}});

        if (post != null) {
            res.render('Post', {title: 'Post Viewer', post: post, id: post_id, postname: post.title, html: post.html,
                category_url: post.category_url, category: post.category, tags: post.tags, user: user});
        } else {
            req.flash('error_msg', 'No post with id: \'' + post_id + '\' in database');
            res.redirect('/edit/');
        }
    } else {
        req.flash('error_msg', 'You are not authenticated.');
        res.redirect("/admin/login");
    }
});

module.exports = router;