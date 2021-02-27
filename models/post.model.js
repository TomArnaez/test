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
        } },
    {
        timestamps: false
    });
    return Post
}