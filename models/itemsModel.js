const { DataTypes } = require('sequelize');
const { sequelize } = require('.');
const Sellers = require('./sellerModel.js');  // Make sure to use the correct path to your Shop model

const Items = sequelize.define(
  'Items',
  {
    item_name: {
      type: DataTypes.STRING,
      primaryKey: true,
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
      defaultValue: false
    },
    Shop_name: {
      type: DataTypes.STRING,
      references: {
        model: 'Sellers', // The name of the referenced table
        key: 'Shop_name',      // The primary key in the Shop table
      },
      onUpdate: 'CASCADE',  // Options when Shop is updated
      onDelete: 'SET NULL', // What to do when Shop is deleted
      allowNull: true,
    },
  },
  {
    indexes: [{ unique: true, fields: ['item_name'] }],
  },
  
);
// Defining the relationship
Items.associate = function(models) {
  Items.belongsTo(models.Sellers, {
    foreignKey: 'Shop_name',
    as: 'shop',
  });
};

module.exports = Items;
