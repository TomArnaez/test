const db = require("../models");
const Term = db.Term;
const Op = db.Sequelize.Op;
const ResponseFormat = require("../utils/ResponseFormat");


exports.findAll = (req, res) => {
    const id = req.params.id
    Term.findAll({ where: {}, include: { model: db.Post, as: "posts", attributes: ['id']} })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Post with id: " + id
            });
        })
};

exports.findOne = (req, res) => {
    const id = req.params.id
    Term.findOne({ where: {}, include: { model: db.Post, as: "posts", attributes: ['id']} })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Post with id: " + id
            });
        })
};

exports.create = (req, res) => {
    return Term.create({ termName: req.body.termName, termType: req.body.termType, termSlug: req.body.termSlug, description: req.body.description })
        .then(term => {
            res.status(201).json(
                ResponseFormat.build(term, "Term created successfully", 201, "success")
            );
        })
        .catch(err => {
            res.status(400).json(
                ResponseFormat.error(err, "Something went wrong with creating term", 400, "error")
            );
        })
}

exports.delete = (req, res) => {
    const id = req.params.id
    return Term.destroy({where: {id: id}})
        .then(del => {
            if (del === 1) {
                res.status(200).json(
                    ResponseFormat.build(del, "Term deleted successfully", 201, "success")
                );
            } else {
                res.status(400).json(
                    ResponseFormat.error(del, "Something went wrong with deleting term", 400, "error")
                );
            }
        })
        .catch(err => {
            res.status(401).json(
                ResponseFormat.error(err, "Something went wrong with deleting Term", 400, "error")
            );
        })
}
