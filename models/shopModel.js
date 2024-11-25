const { DataTypes } = require('sequelize');
const { sequelize } = require('.');
const Sellers = require('./sellerModel.js');

const Shop = sequelize.define(
  'Shop',
  {
    shop_name: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    Seller_Username: {
      type: DataTypes.STRING,
      references: {
        model: Sellers,
        key: 'Username',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // Allows setting to NULL when the referenced seller is deleted
      allowNull: true, // MUST allow NULL to support 'SET NULL'
    },
    Telephone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
  },
  {
    indexes: [{ unique: true, fields: ['shop_name'] }],
  },
);

Shop.associate = function (models) {
  Shop.belongsTo(models.Sellers, {
    foreignKey: 'Seller_Username',
    as: 'seller',
  });
};

module.exports = Shop;
