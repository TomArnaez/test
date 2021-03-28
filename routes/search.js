var express = require('express');
var router = express.Router();

const maybePluralize = (count, noun, suffix = 's') =>
    `${count} ${noun}${count !== 1 ? suffix : ''}`

/* GET search results. */
router.get('/', async (req, res, next) => {
    const db = require("../models");
    const { Op } = require("sequelize");
    const Post = db.Post;
    const Message = db.Message;
    const Term = db.Term;
    const post_results = await Post.findAll({include: { model: Term, as: "terms"}, where: {
        [Op.or]: [
            {
                title: {
                    [Op.substring]: req.query.q
                }
            },
            {
                description: {
                    [Op.like]: '%' + req.query.q
                }
            }
        ]
        }
    });
    const message_results = await Message.findAll({where: {
        title: {
            [Op.substring]: req.query.q
            }
        },
        response: {[Op.ne]: null},
        is_public: 0
    });
    console.log(message_results);
    res.render('search_results', {query: req.query.q, post_results: post_results, message_results: message_results});
});

module.exports = router;
