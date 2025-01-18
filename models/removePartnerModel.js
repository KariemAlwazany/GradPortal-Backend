const { DataTypes } = require('sequelize');
const { sequelize } = require('.');

const RemovePartner = sequelize.define('RemovePartners', {
  Student: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  StudentMessage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  Status: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Pending',
  },
  DoctorMessage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});
module.exports = { RemovePartner };
