var express = require('express');
var router = express.Router();

const maybePluralize = (count, noun, suffix = 's') =>
    `${count} ${noun}${count !== 1 ? suffix : ''}`

/* GET search results. */
router.get('/', async (req, res, next) => {
    const seq = require("../models");
    const { Op } = require("sequelize");
    const post_results = await seq.Post.findAll({include: [{ model: seq.Term, as: "terms"}, {model: seq.User}], where: {
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
    const message_results = await seq.Message.findAll({where: {
        title: {
            [Op.substring]: req.query.q
            }
        },
        response: {[Op.ne]: null},
        is_public: 0
    });
    res.render('search_results', {query: req.query.q, post_results: post_results, message_results: message_results});
});

module.exports = router;
