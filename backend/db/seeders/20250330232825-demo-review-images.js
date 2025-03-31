'use strict';
console.log("Inserting ReviewImages");
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('ReviewImages', [
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
    await queryInterface.bulkDelete('ReviewImages', null, {});
  }
};