const { DataTypes } = require('sequelize');
const { sequelize } = require('.');
const Sellers = require('./sellerModel.js');

const Shop = sequelize.define(
  'Shop',
  {
    shop_name: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    Seller_Username: {
      type: DataTypes.STRING,
      references: {
        model: Sellers,
        key: 'Username',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true, 
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
  },
  {
    indexes: [{ unique: true, fields: ['shop_name'] }],
  },
);

module.exports = Shop;
