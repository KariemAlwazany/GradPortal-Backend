const { DataTypes } = require('sequelize');
const { sequelize } = require('.');

const Items = sequelize.define(
  'Items',
  {
    Item_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
      type: DataTypes.BLOB('long'),
      allowNull: false,
    },
    Category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Shop_name: {
      type: DataTypes.STRING,
      references: {
        model: 'Sellers',
        key: 'Shop_name',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true,
    },
    offer_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Offers',
        key: 'Offer_ID',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true,
    },
  },
);

module.exports = Items;
