const { DataTypes } = require('sequelize');
const { sequelize } = require('.');

const WaitingPartner = sequelize.define('WaitingPartner', {
  Partner_1: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Partner_2: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  PartnerStatus: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = { WaitingPartner };
