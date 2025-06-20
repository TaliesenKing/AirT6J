'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      { tableName: 'Spots', ...options },
      'lat',
      {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: true,
      }
    );
    await queryInterface.changeColumn(
      { tableName: 'Spots', ...options },
      'lng',
      {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: true,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      { tableName: 'Spots', ...options },
      'lat',
      {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: false,
      }
    );
    await queryInterface.changeColumn(
      { tableName: 'Spots', ...options },
      'lng',
      {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: false,
      }
    );
  }
};