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
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'open',
    },
  },
  {
    indexes: [{ unique: true, fields: ['shop_name'] }],
  },
);

module.exports = Shop;
