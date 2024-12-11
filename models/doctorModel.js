const { DataTypes } = require('sequelize');
const { sequelize } = require('.');

const Doctor = sequelize.define(
  'Doctor',
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
    Role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    StudentNumber: {
      type: DataTypes.INTEGER,
    },
  },
  {
    indexes: [{ unique: true, fields: ['Username'] }],
  },
);
module.exports = { Doctor };
