'use strict';
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
options.tableName = "Users";

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert(options, [
      {
        id: 1,
        email: 'demo@user.io',
        username: 'Demo-lition',
        hashedPassword: bcrypt.hashSync('password'),
        firstName: 'Demo',
        lastName: 'User',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        email: 'user1@user.io',
        username: 'FakeUser1',
        hashedPassword: bcrypt.hashSync('password2'),
        firstName: 'Fake',
        lastName: 'User1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        email: 'user2@user.io',
        username: 'FakeUser2',
        hashedPassword: bcrypt.hashSync('password3'),
        firstName: 'Fake',
        lastName: 'User2',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete(options, {
      id: { [Sequelize.Op.in]: [1, 2, 3] }
    }, {});
    
    if (process.env.NODE_ENV !== 'production') {
      // Reset auto-increment for SQLite
      await queryInterface.sequelize.query(
        `DELETE FROM sqlite_sequence WHERE name='Users';`
      );
    }
  }
};
