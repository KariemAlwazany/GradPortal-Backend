const { DataTypes } = require('sequelize');
const { sequelize } = require('.');

const Submit = sequelize.define('Submit', {
  Doctor: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Date: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  Student: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  TaskID: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  FileSubmitted: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
});
module.exports = { Submit };
