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
        description: {
            type: Sequelize.TEXT
        },
        slug: {
            type: Sequelize.STRING
        },
        visible: {
            type: Sequelize.INTEGER
        },
        created_on: {
            type: Sequelize.DATE
        },
        last_modified: {
            type: Sequelize.DATE
        },
        author_id: {
            type: Sequelize.INTEGER
        },
        category: {
            type: DataTypes.VIRTUAL,
            get() {
                return `${this.terms[0].termSlug}`;
            },
            set(value) {
                throw new Error("Do not try to set a category value!");
            }
        },
        url: {
            type: DataTypes.VIRTUAL,
            get() {
                return `/posts/${this.category}/${this.id}/${this.title}`;
            },
            set(value) {
                throw new Error("Do not try to set the a url value!'");
            }
        },
        category_url: {
            type: DataTypes.VIRTUAL,
            get() {
                return `${this.terms[0].url}`;
            },
            set(value) {
                throw new Error("Do not try to set a category url value!");
            }
        },
        tags: {
            type: DataTypes.VIRTUAL,
            get() {
                return this.terms.filter(term => term.termType == "tag")
            },
            set(value) {
                throw new Error("Do not try to set a category url value!");
            }
        }
        },
    {
        timestamps: false
    });
    return Post
};