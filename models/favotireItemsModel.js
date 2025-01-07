const { DataTypes } = require('sequelize');
const { sequelize } = require('.');

const FavoriteItems = sequelize.define(
  'FavoriteItems',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users', // Name of the Users table
        key: 'id',      // Primary key of the Users table
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      allowNull: false,
    },
    item_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Items', // Name of the Items table
        key: 'Item_ID', // Primary key of the Items table
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      allowNull: false,
    },
  },
  {
    tableName: 'FavoriteItems', // Explicit table name
    timestamps: true,           // Add createdAt and updatedAt fields
  }
);

module.exports = FavoriteItems;
