const { DataTypes } = require('sequelize');
const { sequelize } = require('.');
    const Rating = sequelize.define('Rating', {
      rating_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      rating: {
        type: DataTypes.FLOAT, // Allow decimal ratings (e.g., 4.5)
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      review: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    });  
    module.exports = Rating;
  