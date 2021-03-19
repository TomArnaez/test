const db = require("../models");
const Post = db.Post;
const Term = db.Term;
const Op = db.Sequelize.Op;

const getPagination = (page, size) => {
    const limit = size ? + size: 3;
    const offset = page ? page * limit : 0;

    return { limit, offset };
}

const getPagingData = (data, page, offset, limit) => {
    const { count: totalItems } = data;
    console.log("Offset: " + offset + " limit: " + limit + " page: " + page);
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

    Post.findAndCountAll({ where: condition, include: { model: Term, as: "terms"}, order: [['created_on', 'DESC']]})
        .then(data => {
            if (category)
                data.rows = data.rows.filter(post => post.category === category);
            if (tag)
                data.rows = data.rows.filter(post => post.tags.filter(function (e) {
                    return e.termSlug === tag;
                }).length > 0)
            data.count = data.rows.length;
            const response = getPagingData(data, page, offset, limit);

            res.send(response);
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
    Post.findOne({where: {id: id}, include: Term})
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Post with id: " + id
             });
        });
}