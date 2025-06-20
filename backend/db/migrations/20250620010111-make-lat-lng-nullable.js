'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Spots', 'lat', {
      type: Sequelize.FLOAT,
      allowNull: true
    });
    await queryInterface.changeColumn('Spots', 'lng', {
      type: Sequelize.FLOAT,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Spots', 'lat', {
      type: Sequelize.FLOAT,
      allowNull: false
    });
    await queryInterface.changeColumn('Spots', 'lng', {
      type: Sequelize.FLOAT,
      allowNull: false
    });
  }
};