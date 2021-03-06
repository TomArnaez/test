const db = require("../models");
const Post = db.Post;
const Term = db.Term;
const Op = db.Sequelize.Op;

const getPagination = (page, size) => {
    const limit = size ? + size: 3;
    const offset = page ? page * limit : 0;

    return { limit, offset };
}

const getPagingData = (data, page, limit) => {
    const { count: totalItems, rows: posts } = data;
    const currentPage = page ? + page: 0;
    const totalPages = Math.ceil(totalItems / limit);

    return { totalItems, posts, totalPages, currentPage};
}

exports.findAll = (req, res) => {
    const { page, size, title, category} = req.query
    let condition = title ? { title: { [Op.like]: `%${title}%` } } : null;
    let categoryCondition = category ? { termSlug: category} : null;
    console.log(category);

    const { limit, offset } = getPagination(page, size);

    Post.findAndCountAll({ where: condition, limit, offset, include: { model: Term, as: "terms", where: categoryCondition}})
        .then(data => {
            const response = getPagingData(data, page, limit);
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
            console.log(data.url);
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Post with id: " + id
             });
        });
}