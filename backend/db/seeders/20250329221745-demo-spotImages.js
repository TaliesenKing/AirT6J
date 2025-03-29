'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('SpotImages', [
      // Spot 1 (Ocean View Apartment)
      {
        spotId: 1,
        url: 'https://example.com/images/ocean-view-apartment/1.jpg',
        preview: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Spot 2 (Mountain Retreat)
      {
        spotId: 2,
        url: 'https://example.com/images/mountain-retreat/1.jpg',
        preview: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Spot 3 (Lakeside Cottage)
      {
        spotId: 3,
        url: 'https://example.com/images/lakeside-cottage/1.jpg',
        preview: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Spot 4 (Forest Cabin)
      {
        spotId: 4,
        url: 'https://example.com/images/forest-cabin/1.jpg',
        preview: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('SpotImages', null, {});
  }
};
