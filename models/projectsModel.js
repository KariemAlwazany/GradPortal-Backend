const { DataTypes } = require('sequelize');
const { sequelize } = require('.');

const Projects = sequelize.define('Graduation_Projects', {
  GP_ID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  Supervisor_1: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Student_1: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Student_2: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Supervisor_2: {
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
  GP_Description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  done: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = { Projects };
