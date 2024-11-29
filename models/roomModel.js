const { DataTypes } = require('sequelize');
const { sequelize } = require('.');

const Room = sequelize.define('Room', {
  Room: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});
module.exports = { Room };
