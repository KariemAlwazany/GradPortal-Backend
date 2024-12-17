const { DataTypes } = require('sequelize');
const { sequelize } = require('.');

const Delivery = sequelize.define('Delivery', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});
module.exports = Delivery;
