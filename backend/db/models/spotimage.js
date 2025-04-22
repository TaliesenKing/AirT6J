'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SpotImage extends Model {
static associate(models) {// define association here
  SpotImage.belongsTo(models.Spot, {
    foreignKey: 'spotId',
    as: 'Spot',
    // onDelete: 'CASCADE',
    // hooks: true
  });
  }
}
SpotImage.init({
  spotId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Spots',
      key: 'id'
    },
      // onDelete: 'CASCADE'
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
  modelName: 'SpotImage',
});
return SpotImage;
};