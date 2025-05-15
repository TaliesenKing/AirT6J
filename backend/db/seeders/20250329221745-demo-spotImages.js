'use strict';
// console.log("Inserting Spotimages");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

options.tableName = "SpotImages";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(options, [
      // Spot 1 (Ocean View Apartment)
      {
        spotId: 1,
        url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
        preview: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        spotId: 2,
        url: 'https://images.pexels.com/photos/7746106/pexels-photo-7746106.jpeg',
        preview: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        spotId: 3,
        url: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg',
        preview: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(options, null, {});
  }
};
