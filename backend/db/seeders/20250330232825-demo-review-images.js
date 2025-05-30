'use strict';
// console.log("Inserting ReviewImages");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

options.tableName = "ReviewImages";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(options, [
      {
        reviewId: 1,  
        url: 'https://example.com/images/review1.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        reviewId: 1,  
        url: 'https://example.com/images/review1_2.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        reviewId: 2,  
        url: 'https://example.com/images/review2.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        reviewId: 3, 
        url: 'https://example.com/images/review3.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(options, null, {});
  }
};