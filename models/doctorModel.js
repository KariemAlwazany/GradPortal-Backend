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
      type: DataTypes.STRING,
      allowNull: true,
    },
    Role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    indexes: [{ unique: true, fields: ['Username'] }],
  },
);
