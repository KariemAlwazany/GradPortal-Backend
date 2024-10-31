const { DataTypes } = require('sequelize');
const { sequelize } = require('.');  // Reference to the initialized Sequelize instance

// Assuming the User model is defined somewhere and imported like this:
const User = require('./user.model');  // Adjust the path to your User model

const ShoppingCart = sequelize.define('ShoppingCart', {
  cart_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  // Foreign key to the User model
  Username: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'User',  // The table name for your User model
      key: 'username', // Assuming 'username' is the primary key in the User model
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  item_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  itemDescription: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  price: {
    type: DataTypes.INTEGER,  // For storing price as a decimal
    allowNull: false,
  },
  Available: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  Picture: {
    type: DataTypes.BLOB('long'),  // Store the picture URL or path
    allowNull: true,
  },
}, {
  indexes: [
    {
      unique: true, // If you want to enforce unique item per cart for each user
      fields: ['Username', 'item_name']
    }
  ],
});

// Define relationships
ShoppingCart.associate = function(models) {
  ShoppingCart.belongsTo(models.User, {
    foreignKey: 'Username',
    as: 'user',
  });
};

module.exports = ShoppingCart;
