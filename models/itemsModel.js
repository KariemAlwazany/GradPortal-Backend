const { DataTypes } = require('sequelize');
const { sequelize } = require('.');

const Items = sequelize.define(
  'Items',
  {
    Item_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,  // Only Item_ID is the primary key
      autoIncrement: true,  // Auto-increment for Item_ID
      allowNull: false,
    },
    item_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    Price: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Available: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
    Picture: {
      type: DataTypes.BLOB('long'),  // Store the picture URL or path
      allowNull: false,
    },
    Category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Shop_name: {
      type: DataTypes.STRING,
      references: {
        model: 'Sellers', // The name of the referenced table
        key: 'Shop_name', // The primary key in the Sellers table
      },
      onUpdate: 'CASCADE',  // Options when Shop is updated
      onDelete: 'SET NULL', // What to do when Shop is deleted
      allowNull: true,
    },
    offer_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Offers', // Reference to the Offers table
        key: 'Offer_ID', // The primary key in the Offers table
      },
      onUpdate: 'CASCADE',  // Update cascading behavior
      onDelete: 'SET NULL', // Delete cascading behavior
      allowNull: true,      // Allow null for items without offers
    },
  },
);

module.exports = Items;
