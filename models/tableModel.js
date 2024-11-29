const { DataTypes } = require('sequelize');
const { sequelize } = require('.');

const Table = sequelize.define('Discussion_Table', {
  Supervisor_1: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Supervisor_2: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  Examiner_1: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Examiner_2: {
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

  GP_Type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  GP_Title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  Room: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = { Table };
