const { DataTypes } = require('sequelize');
const { sequelize } = require('.'); // Make sure to provide the correct path to your sequelize instance
const Sellers = require('./sellerModel.js'); // Import the Sellers model

const Shop = sequelize.define(
  'Shop',
  {
    shop_name: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,  // shop_name is the primary key
    },
    Seller_Username: {
      type: DataTypes.STRING,
      references: {
        model: Sellers,  // Reference the Sellers model
        key: 'Username', // Referencing the primary key in the Sellers table
      },
      onUpdate: 'CASCADE', // Update the Shop when the referenced Username in Sellers is updated
      onDelete: 'SET NULL', // Set Seller_Username to NULL if the referenced seller is deleted
      allowNull: false, // You can make this nullable if needed, but typically FK is not null
    },
    Telephone: {
      type: DataTypes.STRING,
      allowNull: true,  // Nullable
    },
    longitude: {
      type: DataTypes.FLOAT,  // Storing longitude as a float (decimal values)
      allowNull: false,
    },
    latitude: {
      type: DataTypes.FLOAT,  // Storing latitude as a float (decimal values)
      allowNull: false,
    },
  },
  {
    indexes: [{ unique: true, fields: ['shop_name'] }],  // Ensure shop_name is unique
  },
);

// Defining the association
Shop.associate = function(models) {
  Shop.belongsTo(models.Sellers, {
    foreignKey: 'Seller_Username',
    as: 'seller', // This is the alias for the seller association
  });
};

module.exports = Shop;
