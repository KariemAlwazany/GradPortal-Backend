const { DataTypes } = require('sequelize');
const { sequelize } = require('.');
const Shop = require('../models/shopModel');
const Sellers = require('../models/sellerModel');
const User = require('../models/userModel');

const Receipt = sequelize.define('Receipt', {
  Receipt_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Orders', // Reference to Orders table
      key: 'order_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  ShopName: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Shops',
      key: 'shop_name',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  buyer_Username: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'username',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  buyer_phone_number: {
    type: DataTypes.STRING, // Updated to STRING for international phone numbers
    allowNull: false,
  },
  items: {
    type: DataTypes.JSON, // Stores an array of item details
    allowNull: false,
  },
  total_price: {
    type: DataTypes.INTEGER, // Total cost for the receipt
    allowNull: false,
  },
  Payment_Method: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = Receipt;
