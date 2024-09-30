const { DataTypes, VIRTUAL } = require('sequelize');
const { sequelize } = require('.');
const bcrypt = require('bcrypt');
const validator = require('validator');
const crypto = require('crypto');
const { Event } = require('./eventsModel');
const AppError = require('../utils/appError');

const User = sequelize.define(
  'User',
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    passwordconfirm: {
      type: DataTypes.VIRTUAL,
      validate: {
        isPasswordMatch(value) {
          if (this.password !== value) {
            throw new AppError('Passwords do not match', 401);
          }
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isValidEmail(value) {
          if (!validator.isEmail(value)) {
            throw new AppError('Invalid Email', 401);
          }
        },
      },
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user',
    },

    passwordChangedAt: {
      type: DataTypes.VIRTUAL,
      allowNull: true,
    },

    passwordResetToken: {
      type: DataTypes.VIRTUAL,
      allowNull: true,
    },
    passwordResetExpires: {
      type: DataTypes.VIRTUAL,
      allowNull: true,
    },

    // active: {
    //   type: Boolean,
    //   defaultValue: true,
    //   select: false,
    // },
    Event_ID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    indexes: [
      { unique: true, fields: ['email'] },
      { unique: true, fields: ['username'] },
    ],
  },
);
User.beforeSave(async (user, options) => {
  if (user.changed('password') || user.isNewRecord) {
    user.password = await bcrypt.hash(user.password, 12);
    user.passwordChangedAt = Date.now() - 1000;
    user.passwordconfirm = undefined;
  }
});

User.prototype.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
User.prototype.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt / 1000, 10);

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};
User.prototype.generatePasswordToken = function () {
  const token = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return token;
};
module.exports = { User };
