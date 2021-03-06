const { DataTypes } = require("sequelize");

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
        url: {
            type: DataTypes.VIRTUAL,
            get() {
                return `/posts/${this.terms[0].termSlug}/${this.id}/${this.slug}`;
            },
            set(value) {
                throw new Error("Do not try to set the 'fullName' value!'");
            }
        }
        },
    {
        timestamps: false
    });
    return Post
};