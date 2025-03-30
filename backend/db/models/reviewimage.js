'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ReviewImage extends Model {
static associate(models) {// define association here
  ReviewImage.belongsTo(models.Review, {
    foreignKey: 'reviewId',
    as: 'review',
    onDelete: 'CASCADE',
    hooks: true
  });
  }
}
ReviewImage.init({
  spotId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Reviews',
      key: 'id'
    },
      onDelete: 'CASCADE'
    },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isUrl: true // This ensures the URL is a valid format
      }
    },
  preview: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'ReviewImage',
});
return ReviewImage;
};