var config = require('../config/config.js');

const Sequelize = require('sequelize');
const sequelize = new Sequelize(config.mysql.name, config.mysql.user, config.mysql.pass, {
    host: config.mysql.host,
    dialect: config.mysql.dialect,
    operatorsAliases: false,
    pool: config.mysql.pool,
    logging: false
});

const db = {}

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Post = require('./post.model.js')(sequelize, Sequelize);
db.Term = require('./term.model.js')(sequelize, Sequelize);
db.Message = require('./message.model.js')(sequelize, Sequelize);
db.User = require('./user.model.js')(sequelize, Sequelize);

const postTerms = sequelize.define('postTerms', {
}, { timestamps: false});

db.PostTerms = postTerms;

db.Post.belongsToMany(db.Term, {through: postTerms});
db.Term.belongsToMany(db.Post, {through: postTerms});
db.User.hasMany(db.Post, {
    foreignKey: 'author_id',
    sourceKey: 'id'
});
db.Post.belongsTo(db.User, {
    foreignKey: 'author_id',
    targetKey: 'id'
});


module.exports = db;
