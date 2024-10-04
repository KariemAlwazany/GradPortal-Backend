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
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    indexes: [{ unique: true, fields: ['Username'] }],
  },
);
