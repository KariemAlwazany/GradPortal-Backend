const { DataTypes } = require('sequelize');
const { sequelize } = require('.');

const Student = sequelize.define(
  'Student',
  {
    Username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Registration_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Degree: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },
    Status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'start',
    },
  },
  {
    indexes: [{ unique: true, fields: ['Username'] }],
  },
);
module.exports = { Student };
