const config = require('../config/config.js');
const catchAsync = require('../utils/catchAsync');
const { Sequelize } = require('sequelize');
//come.nt
const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  host: config.HOST,
  dialect: config.dialect,
});
catchAsync(async (req, res, next) => {
  sequelize.authenticate();
});

const db = {};
db.sequelize = sequelize;
db.sequelize.sync({ force: true, alter: true }).then(() => {
  //if we change this flag to true it will reset the database
  console.log('Synced');
});
module.exports = db;
