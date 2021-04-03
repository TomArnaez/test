const db = require("../models");
const Term = db.Term;
const Op = db.Sequelize.Op;

exports.delete = (req, res) => {
    const id = req.params.id
    Term.destroy({where: {id: id}})
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Term was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete Term with id=${id}. Maybe Tutorial was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Term with id=" + id
            });
        });
}
