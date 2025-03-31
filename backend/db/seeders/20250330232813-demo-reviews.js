'use strict';
console.log("Inserting Reviews");
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Reviews', [
      {
        spotId: 1,  
        userId: 1,  
        review: 'Great place! Would love to visit again.',
        stars: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        spotId: 2,  
        userId: 2,  
        review: 'Not as good as I expected. The service could be better.',
        stars: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        spotId: 3,  
        userId: 3,  
        review: 'Amazing experience! Everything was perfect.',
        stars: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Reviews', null, {});
  }
};