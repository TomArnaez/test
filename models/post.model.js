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
        author: {
            type: DataTypes.VIRTUAL,
            get() {
                return "USER_PLACEHOLDER";
            }
        },
        url: {
            type: DataTypes.VIRTUAL,
            get() {
                return `/posts/${this.terms[0].termSlug}/${this.id}/${this.slug}`;
            },
            set(value) {
                throw new Error("Do not try to set the a url value!'");
            }
        },
        category: {
            type: DataTypes.VIRTUAL,
            get() {
                return `${this.terms[0].termName}`;
            },
            set(value) {
                throw new Error("Do not try to set a category value!");
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