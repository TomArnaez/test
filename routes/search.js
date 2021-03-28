var express = require('express');
var router = express.Router();

const maybePluralize = (count, noun, suffix = 's') =>
    `${count} ${noun}${count !== 1 ? suffix : ''}`

/* GET search results. */
router.get('/', function(req, res, next) {
    const db = require("../models");
    const { Op } = require("sequelize");
    const Post = db.Post;
    const Term = db.Term;
    Post.findAll({include: { model: Term, as: "terms"}, where: {
        [Op.or]: [
            {
                title: {
                    [Op.like]: '%' + req.query.q
                }
            },
            {
                description: {
                    [Op.like]: req.query.q
                }
            }
        ]
        }
    }).then(post_results => {
        res.render('search_results', {query: req.query.q, post_results: post_results});
    })

});

module.exports = router;
