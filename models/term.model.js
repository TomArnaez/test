const { DataTypes } = require("sequelize");

/**
 * Terms are used for categorising posts. They belong to many posts and can
 * have many labels. Need to create a post with tags? Then you might create a post
 * with a 'tag' term:
 *
 * postTerms: [{
 *    termType: tag,
 *    termName: finance
 *  },{
 *    termType: tag,
 *    termName: support group
 *  }]
 */

module.exports = (sequelize, DataTypes) => {
    const Term = sequelize.define('term', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        termType: {
            type: DataTypes.STRING
        },
        termName: {
            type: DataTypes.STRING
        },
        termSlug: {
            type: DataTypes.STRING,
            unique: true
        },
        description: {
            type: DataTypes.TEXT
        },
        url: {
            type: DataTypes.VIRTUAL,
            get() {
                return `/posts/${this.termType.toLowerCase()}/${this.termSlug}`;
            },
            set(value) {
                throw new Error("Do not try to set the a url value!'");
            }
        },
    }, {
        timestamps: false
    });
    return Term;
};