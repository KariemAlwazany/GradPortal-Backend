const { DataTypes } = require('sequelize');
const { sequelize } = require('.');

const WaitingList = sequelize.define(
  'WaitingList',
  {
    List_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    Partner_1: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'Students', // References the actual table name
        key: 'Username',
      },
    },
    Partner_2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ProjectType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ProjectStatus: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    PartnerStatus: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    DoctorStatus: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Doctor1: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Doctor2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Doctor3: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ProjectTitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ProjectDescription: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'WaitingLists',
  },
);

module.exports = { WaitingList }; // Export the model
