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
                if (this.terms != null)
                    return `${this.terms.find(t => t.termType == "category").termName}`;
                else
                    return "uncategorised";
            },
            set(value) {
                throw new Error("Do not try to set a category value!");
            }
        },
        category_id: {
            type: DataTypes.VIRTUAL,
            get() {
                if (this.terms != null)
                    return `${this.terms.find(t => t.termType == "category").id}`;
                else
                    return "0";
            },
            set(value) {
                throw new Error("Do not try to set a category value!");
            }
        },
          category_slug: {
              type: DataTypes.VIRTUAL,
              get() {
                  if (this.terms != null)
                      return `${this.terms.find(t => t.termType == "category").termSlug}`;
                  else
                      return "0";
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
                if (this.terms != null)
                    return `${this.terms[0].url}`;
                else
                    return null;
            },
            set(value) {
                throw new Error("Do not try to set a category url value!");
            }
        },

        tags: {
            type: DataTypes.VIRTUAL,
            get() {
                if (this.terms != null)
                    return this.terms.filter(term => term.termType == "tag")
                else
                    return [];
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