const { DataTypes } = require('sequelize');
const { sequelize } = require('.');

const Cart = sequelize.define(
    'Cart', 
    {
  cart_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
    onDelete: 'CASCADE', 
  },
});

module.exports = Cart;
