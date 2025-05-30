'use strict';

const { Model, Validator } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // One-to-many: A user can have many spots
      User.hasMany(models.Spot, {
        foreignKey: 'ownerId',
        // onDelete: 'CASCADE',  // Ensures when a user is deleted, their spots are also deleted
        // hooks: true
      });

      // One-to-many: A user can have many reviews
      User.hasMany(models.Review, {
        foreignKey: 'userId',
        // onDelete: 'CASCADE',  // Ensures when a user is deleted, their reviews are also deleted
        // hooks: true
      });
    }
  }

  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [4, 30],
          isNotEmail(value) {
            if (Validator.isEmail(value)) {
              throw new Error('Cannot be an email.');
            }
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [3, 256],
          isEmail: true,
        },
      },
      firstName: {  
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [2, 50], 
        },
      },
      lastName: {  
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [2, 50], 
        },
      },
      hashedPassword: {
        type: DataTypes.STRING.BINARY,
        allowNull: false,
        validate: {
          len: [60, 60],
        },
      },
    },
    {
      sequelize,
      modelName: 'User',
      defaultScope: {
        attributes: {
          exclude: ['hashedPassword', 'email', 'createdAt', 'updatedAt'],
        },
      },
    }
  );
  return User;
};