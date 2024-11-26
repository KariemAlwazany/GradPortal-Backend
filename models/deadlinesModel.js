const { DataTypes } = require('sequelize');
const { sequelize } = require('.');

const Deadline = sequelize.define('Deadline', {
  Doctor: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Date: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  File: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  Description: {
    type: DataTypes.STRING,
    allowNull: true,
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
module.exports = { Deadline };
