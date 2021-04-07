const db = require("../models");
const Post = db.Post;
const Term = db.Term;
const User = db.User;
const Op = db.Sequelize.Op;

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
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Post with id: " + id
            });
        });
}

exports.delete = (req, res) => {
    const id = req.params.id
    Post.destroy({where: {id: id}})
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Post was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete Post with id=${id}. Maybe Post was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Post with id=" + id
            });
        });
}