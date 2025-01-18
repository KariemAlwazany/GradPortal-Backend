const { DataTypes } = require('sequelize');
const { sequelize } = require('.');

const OrderItems = sequelize.define('OrderItems', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Orders',
      key: 'order_id',
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
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = OrderItems;
