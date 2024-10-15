const { DataTypes } = require('sequelize');
const { sequelize } = require('.');  // Reference to the initialized Sequelize instance

// Assuming the Shop, Seller, and User models are defined and imported
const Shop = require('./shop.model');   // Adjust the path to your Shop model
const Seller = require('./seller.model');  // Adjust the path to your Seller model
const User = require('./user.model');   // Adjust the path to your User model

const Receipt = sequelize.define('Receipt', {
  Receipt_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  // Foreign key to the Shop model
  shop_name: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Shops',  // The table name for your Shop model
      key: 'name',     // The primary key in the Shop model
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
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
    onDelete: 'SET NULL',
  },
  // Foreign key to the User model for the buyer
  buyer_Username: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'User',  // The table name for your User model
      key: 'username', // Assuming 'username' is the primary key in the User model
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
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

// Define relationships
Receipt.associate = function(models) {
  Receipt.belongsTo(models.Seller, {
    foreignKey: 'shop_name',
    as: 'shop',
  });
  
  Receipt.belongsTo(models.Seller, {
    foreignKey: 'Seller_Username',
    as: 'seller',
  });
  
  Receipt.belongsTo(models.User, {
    foreignKey: 'buyer_Username',
    as: 'buyer',
  });
};

module.exports = Receipt;
