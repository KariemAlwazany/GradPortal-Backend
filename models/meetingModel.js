const { DataTypes } = require('sequelize');
const { sequelize } = require('.');

const Meeting = sequelize.define('Meeting', {
  Student_1: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Student_2: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Doctor: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  GP_Type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  GP_Title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  MeetingID: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  RoomStatus: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = { Meeting };
