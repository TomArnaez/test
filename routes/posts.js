var express = require('express');
var router = express.Router();
const db = require("../models");
const Term = db.Term;
const Post = db.Post;
var axios = require('axios');

router.get('/category/:category', async(req, res, next) => {
    if (req.isAuthenticated()) {
        var permissions = await getUserPermission(req.user);
        // Send get request to API to get posts
        axios('http://localhost:3000/api/posts', {
            method: 'GET',
        }).then(results => {
            results.data = results.data.filter(post => post.category_slug == req.params.category)
            res.render('category', {posts: results.data, found: true, categoryName: req.params.category, permission: permissions[0].permission_level})
        })
    } else {
        res.redirect('/admin/login');
    }

});

router.get("/tag/:tag", async(req, res, next) => {
    if (req.isAuthenticated()) {
        var permissions = await getUserPermission(req.user);
        // Send get request to API to get posts
        axios('http://localhost:3000/api/posts', {
            method: 'GET',
        }).then(results => {
            results.data = results.data.filter(post => post.tags.filter(tag => tag.termSlug == req.params.tag).length > 0)
            res.render('category', {posts: results.data, found: true, categoryName: req.params.category, permission: permissions[0].permission_level})
        })
    } else {
        res.redirect('/admin/login');
    }

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

function getUserPermission(userID){
    return new Promise((resolve,reject)=>{
        const db = require("../database");
        db.query("SELECT * FROM users WHERE id = ?",[userID], (err, result)=> {
            if(err) throw err
            if(result.length > 0)
                resolve(result);
            else resolve(null);

        });
    });
}

module.exports = router;
