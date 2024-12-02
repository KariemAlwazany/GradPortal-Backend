const { DataTypes } = require('sequelize');
const { sequelize } = require('.');

const Sellers = sequelize.define('Sellers', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  Username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  Phone_number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Shop_name: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
});
module.exports = Sellers;
