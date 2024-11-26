const { DataTypes } = require('sequelize');
const { sequelize } = require('.');

const Reservation = sequelize.define('Reservation', {
  Student: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Doctor: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = { Reservation };
