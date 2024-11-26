const { DataTypes } = require('sequelize');
const { sequelize } = require('.');

const Messages = sequelize.define('Messages', {
  Sender: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Receiver: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  Message: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
});
module.exports = { Messages };
