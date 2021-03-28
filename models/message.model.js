const { DataTypes } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
    const Message = sequelize.define('message', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: Sequelize.TEXT
        },
        custom_id: {
            type: Sequelize.TEXT
        },
        is_public: {
            type: Sequelize.INTEGER
        },
        message: {
            type: Sequelize.TEXT
        },
        response: {
            type: Sequelize.TEXT
        },
        url: {
            type: DataTypes.VIRTUAL,
            get() {
                return `/message/response/${this.custom_id}`;
            },
            set(value) {
                throw new Error("Do not try to set the a url value!'");
            }
        }
        },
        {
            timestamps: false
        });
    return Message;
}