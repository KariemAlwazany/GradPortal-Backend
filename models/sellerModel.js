const { DataTypes } = require('sequelize');
const { sequelize } = require('.');

const Seller = sequelize.define(
  'Seller',
  {
    Username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Shop_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    indexes: [{ unique: true, fields: ['Username'] }],
  },
);
module.exports = { Seller };
