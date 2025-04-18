const { DataTypes } = require('sequelize');
const { sequelize } = require('.');

const Orders = sequelize.define('Orders', {
  order_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  buyer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  total_price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'declined', 'Delivering'),
    allowNull: false,
    defaultValue: 'pending',
  },
  payment_method: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  delivery_method: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  delivery_location: {
    type: DataTypes.JSON, // Store as a JSON object with longitude, latitude, and city
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = Orders;
