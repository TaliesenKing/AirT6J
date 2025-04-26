'use strict';
// console.log("Inserting Spots");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

options.tableName = "Spots";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(options, [
      {
        ownerId: 1,
        address: '123 Ocean Blvd',
        city: 'Miami',
        state: 'FL',
        country: 'USA',
        lat: 25.7617,
        lng: -80.1918,
        name: 'Ocean View Apartment',
        description: 'A cozy apartment with breathtaking ocean views. Ideal for beach lovers.',
        price: 150.00,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ownerId: 2,
        address: '456 Mountain Rd',
        city: 'Denver',
        state: 'CO',
        country: 'USA',
        lat: 39.7392,
        lng: -104.9903,
        name: 'Mountain Retreat',
        description: 'A serene retreat in the heart of the mountains. Perfect for hiking and nature lovers.',
        price: 200.00,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ownerId: 3,
        address: '789 Lakeside Dr',
        city: 'Austin',
        state: 'TX',
        country: 'USA',
        lat: 30.2672,
        lng: -97.7431,
        name: 'Lakeside Cottage',
        description: 'A charming cottage by the lake, offering peace and tranquility with modern amenities.',
        price: 175.00,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // {
      //   ownerId: 4,
      //   address: '101 Forest Ln',
      //   city: 'Portland',
      //   state: 'OR',
      //   country: 'USA',
      //   lat: 45.5152,
      //   lng: -122.6784,
      //   name: 'Forest Cabin',
      //   description: 'A rustic cabin nestled in the woods. A perfect getaway for those looking to escape the hustle and bustle.',
      //   price: 180.00,
      //   createdAt: new Date(),
      //   updatedAt: new Date(),
      // }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(options, null, {});
  }
};
