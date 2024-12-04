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
  Seller_Username: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Sellers',
      key: 'username', 
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
    type: DataTypes.INTEGER, 
    allowNull: false,  
  },
  itemName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
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
