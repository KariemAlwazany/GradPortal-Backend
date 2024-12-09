const { DataTypes } = require('sequelize');
const { sequelize } = require('.');

const Offers = sequelize.define(
  'Offers',
  {
    Offer_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true, // Only Offer_ID is the primary key
      autoIncrement: true, // Auto-increment for Offer_ID
      allowNull: false,
    },
    Percentage: {
      type: DataTypes.FLOAT,
      allowNull: false, // Percentage must be a value between 0 and 100
      validate: {
        min: 0,
        max: 100,
      },
    },
    Description: {
      type: DataTypes.STRING,
      allowNull: true, // Optional field, but can be null
    },
  },
);

module.exports = Offers;
