const { DataTypes } = require('sequelize');
const { sequelize } = require('.');  // Reference to the initialized Sequelize instance
const Shop = require('../models/shopModel');  // Ensure the Shop model is imported correctly
const Sellers = require('../models/sellerModel');
const User = require('../models/userModel');  // Make sure User model is also imported

const Receipt = sequelize.define('Receipt', {
  Receipt_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  // Foreign key to the Shop model
  ShopName: {
    type: DataTypes.STRING,
    allowNull: false,  // Keep it non-nullable
    references: {
      model: 'Shops',  // Ensure this matches the pluralized table name, which is 'Shops'
      key: 'shop_name', // The primary key in the Shop model (or use `name` if that's your key)
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE', 
  },
  // Foreign key to the Seller model
  Seller_Username: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Sellers',  // The table name for your Seller model
      key: 'username',   // The primary key in the Seller model
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  // Foreign key to the User model for the buyer
  buyer_Username: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Users',  // The table name for your User model (make sure 'Users' is the correct table name)
      key: 'username', // Assuming 'username' is the primary key in the User model
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
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
    type: DataTypes.DECIMAL(10, 2),  // For storing price as a decimal
    allowNull: false,
  },
  Payment_Method: {
    type: DataTypes.STRING,  // You can use an ENUM for fixed payment methods if needed
    allowNull: false,
  },
  Date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,  // Automatically sets the current date
  },
});

module.exports = Receipt;
