const { sequelize } = require('./db/models');
console.log(process.env.NODE_ENV)


sequelize.showAllSchemas({ logging: false }).then(async (data) => {
  if (!data.includes(process.env.SCHEMA)) {
    await sequelize.createSchema(process.env.SCHEMA);
  }
});