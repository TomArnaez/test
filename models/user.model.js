const { DataTypes } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define('user', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            user_login: {
                type: Sequelize.TEXT
            },
            user_fname: {
                type: Sequelize.TEXT
            },
            user_lname: {
                type: Sequelize.TEXT
            }
        },
        {
            timestamps: false
        });
    return User;
}