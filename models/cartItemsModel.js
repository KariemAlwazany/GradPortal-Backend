const { DataTypes } = require('sequelize');
const { sequelize } = require('.');

const CartItems = sequelize.define('CartItems', {
  cart_item_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  cart_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Cart',
      key: 'cart_id',
    },
    onDelete: 'CASCADE',
  },
  item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Items',
      key: 'Item_ID',
    },
    onDelete: 'CASCADE',
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  price: {
    type: DataTypes.INTEGER, // Assuming item price is stored here
    allowNull: false,
  },
});

module.exports = CartItems;
