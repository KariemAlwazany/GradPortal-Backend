
const Seller = require('./../models/sellerModel');
const db1 = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./factoryController');
const AppError = require('../utils/appError');

const User = db1.User;
const getCurrentSeller = catchAsync(async (req, res, next) => {
  const userID = req.user.id;

  const user = await User.findOne({ where: { id: userID } });
  const username = user.Username;
  
  const seller = await Seller.findOne({ where: { Username: username } });
  res.status(200).send(seller);
});

const getAllSellerData = catchAsync(async (req, res, next) => {
  const userID = req.user.id;

  const user = await User.findOne({ where: { id: userID } });

  res.status(200).send(user);
});

const updateSellerAndUser = catchAsync(async (req, res, next) => {
  const { id } = req.user; 
  const {
    Username,
    Phone_number,
    Shop_name,
    FullName,
    Email,
    Password,
  } = req.body;

  const user = await User.findOne({
    where: { id },
  });

  if (!user) {
    return next(new AppError('No user found with the given ID', 404));
  }

  const oldUsername = user.Username; 

  const userUpdates = {};
  if (Username) userUpdates.Username = Username; 
  if (FullName) userUpdates.FullName = FullName;
  if (Email) userUpdates.Email = Email;
  if (Password) {
    const bcrypt = require('bcryptjs');
    userUpdates.Password = await bcrypt.hash(Password, 12); 
  }

  if (Object.keys(userUpdates).length > 0) {
    const updatedUser = await User.update(userUpdates, {
      where: { id },
    });

    if (!updatedUser[0]) {
      return next(new AppError('Failed to update the user record', 500));
    }
  }

  const sellerUpdates = {};
  if (Phone_number) sellerUpdates.Phone_number = Phone_number;
  if (Shop_name) sellerUpdates.Shop_name = Shop_name;

  if (Username) {
    sellerUpdates.Username = Username; 
  }

  if (Object.keys(sellerUpdates).length > 0) {
    const updatedSeller = await Seller.update(sellerUpdates, {
      where: { Username: oldUsername }, 
    });

    if (!updatedSeller[0]) {
      return next(new AppError('Failed to update the seller record', 500));
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: userUpdates,
      seller: sellerUpdates,
    },
  });
});

  
  
  
exports.findAllSellers = factory.getAll(Seller); 
exports.updateSeller = factory.updateOne(Seller);
exports.deleteSeller = factory.deleteOne(Seller);
exports.getCurrentSeller = getCurrentSeller;
exports.getAllSellerData = getAllSellerData;
exports.updateSellerAndUser = updateSellerAndUser;










