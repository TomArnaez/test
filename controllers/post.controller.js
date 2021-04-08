const db = require("../models");
const Post = db.Post;
const Term = db.Term;
const User = db.User;
const Op = db.Sequelize.Op;
const ResponseFormat = require("../utils/ResponseFormat");

const getPagination = (page, size) => {
    const limit = size ? + size: 3;
    const offset = page ? page * limit : 0;

    return { limit, offset };
}

const getPagingData = (data, page, offset, limit) => {
    const { count: totalItems } = data;
    const posts = data.rows.slice(offset, offset + limit);
    const pageItems = posts.length;
    const currentPage = page ? + page: 0;
    const totalPages = Math.ceil(totalItems / limit);
    return { totalItems, pageItems, totalPages, currentPage, posts};
}

exports.findAll = (req, res) => {
    const { page, size, title, category, tag} = req.query
    let condition = title ? { title: { [Op.like]: `%${title}%` } } : null;
    const { limit, offset } = getPagination(page, size);

    Post.findAll({ where: condition, include: [{ model: Term, as: "terms"}, {model: User}], order: [['created_on', 'DESC']]})
        .then(data => {
            if (category)
                data = data.filter(post => post.category === category);
            if (tag)
                data = data.filter(post => post.tags.filter(function (e) {
                    return e.termSlug === tag;
                }).length > 0)
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving posts."
            });
        });
};

exports.findOne = (req, res) => {
    const id = req.params.id
    //Post.findByPk(id)
    Post.findOne({where: {id: id}, include: [{ model: Term, as: "terms"}, {model: User}]})
        .then(data => {
            if (data === null)
                res.status(500).send({
                    message: "Error retrieving Post with id: " + id
                });
            else
                res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Post with id: " + id
            });
        });
}

exports.delete = (req, res) => {
    console.log(req.params);
    const id = req.params.id
    return Post.destroy({where: {id: id}})
        .then(del => {
            console.log(id);
            console.log(del);
            if (del === 1) {
                res.status(200).json(
                    ResponseFormat.build(del, "Post deleted successfully", 201, "success")
                );
            } else {
                res.status(400).json(
                    ResponseFormat.error(del, "Something went wrong with deleting post", 400, "error")
                );
            }
        })
        .catch(err => {
            res.status(401).json(
                ResponseFormat.error(err, "Something went wrong with deleting Post", 400, "error")
            );
        });
}

exports.create = (req, res) => {
    console.log(req.body)
    Post.create({ title: req.body.title, html: req.body.html, author_id: req.body.author_id, description: req.body.description})
        .then(post => {
            db.PostTerms.create({postId: post.id, termId: req.body.category})
                .then(pt => {
                    post.getTerms().then(a => {
                        console.log(a);
                    })
                })
            res.status(201).json(
                ResponseFormat.build(post, "Post created successfully", 201, "success")
            );
        })
        .catch(err => {
            res.status(400).json(
                ResponseFormat.error(String(err), "Something went wrong with creating post", 400, "error")
            );
        })
}