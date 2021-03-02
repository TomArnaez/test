module.exports = (sequelize, Sequelize) => {
    const Post = sequelize.define('post', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement : true,
            primaryKey: true,
        },
        title: {
            type: Sequelize.STRING
        },
        html: {
            type: Sequelize.TEXT
        },
        text: {
            type: Sequelize.STRING
        },
        slug: {
            type: Sequelize.STRING
        },
        created_on: {
            type: Sequelize.DATE
        },
        last_modified: {
            type: Sequelize.DATE
        },
        },
    {
        timestamps: false
    });
    return Post
};