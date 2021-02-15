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
        text: {
            type: Sequelize.STRING
        } },
    {
        timestamps: false
    });
    return Post
}