'use strict';
const {
  Model,
  DataTypes
} = require('sequelize');

module.exports = (sequelize) => {
  class Review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // A Review belongs to a User through userId
      Review.belongsTo(models.User, {
        foreignKey: 'userId',
        onDelete: 'CASCADE',  // Cascade delete when a User is deleted
      });

      // A Review belongs to a Spot through spotId
      Review.belongsTo(models.Spot, {
        foreignKey: 'spotId',
        onDelete: 'CASCADE',  // Cascade delete when a Spot is deleted
      });

      // A Review has many ReviewImages through reviewId
      Review.hasMany(models.ReviewImage, {
        foreignKey: 'reviewId',
        onDelete: 'CASCADE',  // Cascade delete when a Review is deleted
      });
    }
  }

  // Initialize the Review model with validations
  Review.init({
    spotId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'spotId cannot be null'
        },
        isInt: {
          msg: 'spotId must be an integer'
        }
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'userId cannot be null'
        },
        isInt: {
          msg: 'userId must be an integer'
        }
      }
    },
    review: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Review text cannot be empty'
        },
        notEmpty: {
          msg: 'Review text cannot be empty'
        }
      }
    },
    stars: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Stars cannot be null'
        },
        isInt: {
          msg: 'Stars must be an integer'
        },
        min: {
          args: [1],
          msg: 'Stars must be between 1 and 5'
        },
        max: {
          args: [5],
          msg: 'Stars must be between 1 and 5'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Review',
  });

  return Review;
};
