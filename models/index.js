var config = require('../config/config.js');

const Sequelize = require('sequelize');
const sequelize = new Sequelize(config.mysql.name, config.mysql.user, config.mysql.pass, {
    host: config.mysql.host,
    dialect: config.mysql.dialect,
    operatorsAliases: false,
    pool: config.mysql.pool
});

const db = {}

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Post = require('./post.model.js')(sequelize, Sequelize);

module.exports = db;
