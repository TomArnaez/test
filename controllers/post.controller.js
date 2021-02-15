const db = require("../models");
const Post = db.Post;
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
    const { page, size, title } = req.query
    var condition = title ? { title: { [Op.like]: `%${title}%` } } : null;

    const { limit, offset } = getPagination(page, size);

    Post.findAndCountAll({ where: condition, limit, offset })
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
