const { DataTypes } = require('sequelize');
const { sequelize } = require('.');

const Status = sequelize.define('Status', {
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});
module.exports = { Status };
