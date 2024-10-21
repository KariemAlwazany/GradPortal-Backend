// models/favProjectsModel.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('.');

const FavProjects = sequelize.define('FavProjects', {
  GP_ID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Graduation_Projects',
      key: 'GP_ID',
    },
  },
  User_ID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = { FavProjects };
