const { DataTypes } = require('sequelize');
const { sequelize } = require('.');

const Sellers = sequelize.define(
  'Sellers',
  {
    Username: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,  // 'Username' is the primary key
    },
    Phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Shop_name: {
      type: DataTypes.STRING,
      allowNull: true,  // 'Shop_name' cannot be null
      unique: true,      // Make 'Shop_name' unique
    },
  },
  {
    // You don't need an additional index for 'Shop_name' because 'unique: true' already creates an index
  },
);

module.exports = Sellers;
