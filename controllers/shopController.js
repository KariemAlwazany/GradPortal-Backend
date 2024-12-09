const factory = require('./factoryController');
const Shop = require('./../models/shopModel'); 
const Sellers = require('./../models/sellerModel');
const db1 = require('./../models/userModel');
const User = db1.User;
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Items = require('../models/itemsModel');

const createShop = async (req, res) => {
    try {
      const { Username } = req.user; 
  
      if (!Username) {
        return res.status(400).json({ message: 'Invalid token or missing username' });
      }
  
      const seller = await Sellers.findOne({ where: { Username } });
      if (!seller) {
        return res.status(404).json({ message: 'Seller not found' });
      }
  
      const shop_name = seller.Shop_name;
      if (!shop_name) {
        return res.status(400).json({ message: 'Seller does not have a shop name associated' });
      }
  
      const existingShop = await Shop.findOne({ where: { shop_name } });
      if (existingShop) {
        return res.status(400).json({ message: 'A shop with this name already exists' });
      }
  
      const { Telephone, longitude, latitude } = req.body;
  
      const newShop = await Shop.create({
        shop_name,
        Seller_Username: Username,
        Telephone,
        longitude,
        latitude,
      });
  
      res.status(201).json({
        message: 'Shop created successfully',
        shop: newShop,
      });
    } catch (error) {
      console.error('Error creating shop:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  

const closeShopTemporary = catchAsync(async (req, res, next) => {
  // Get the logged-in user's ID from the request
  const userID = req.user.id;

  // Find the user in the User table
  const user = await User.findOne({ where: { id: userID } });
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Use the username to find the seller in the Seller table
  const seller = await Sellers.findOne({ where: { Username: user.Username } });
  if (!seller) {
    return next(new AppError('Seller not found', 404));
  }

  // Get the shop_name from the Seller table
  const shopName = seller.Shop_name;
  if (!shopName) {
    return next(new AppError('No shop associated with this seller', 404));
  }

  // Find and update all items associated with the shop to set 'Available' as false
  const items = await Items.findAll({ where: { Shop_name: shopName } });
  if (items.length > 0) {
    // Mark items as unavailable (Available: false)
    await Items.update(
      { Available: false }, 
      { where: { Shop_name: shopName } }
    );
    console.log(`Marked ${items.length} items as unavailable.`);
  }

  // Find and update the shop to mark it as temporarily closed (you could use a 'status' field or similar)
  const shop = await Shop.findOne({ where: { Shop_name: shopName } });
  if (!shop) {
    return next(new AppError('Shop not found', 404));
  }

  // Optionally, you can add a field to indicate the shop is temporarily closed
  shop.status = 'Closed'; // Example, you can add a 'status' field in your Shop model if needed
  await shop.save();
  console.log(`Shop '${shopName}' has been marked as temporarily closed.`);

  res.status(200).json({
    status: 'success',
    message: `Shop '${shopName}' has been temporarily closed, and its items have been marked as unavailable.`,
  });
});



const deleteShop = catchAsync(async (req, res, next) => {
  const userID = req.user.id;
  const user = await User.findOne({ where: { id: userID } });
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  const seller = await Sellers.findOne({ where: { Username: user.Username } });
  if (!seller) {
    return next(new AppError('Seller not found', 404));
  }
  const shopName = seller.Shop_name;
  if (!shopName) {
    return next(new AppError('No shop associated with this seller', 404));
  }
  const items = await Items.findAll({ where: { Shop_name: shopName } });
  if (items.length > 0) {
    await Items.destroy({ where: { Shop_name: shopName } });
    console.log(`Deleted ${items.length} items associated with the shop.`);
  }

  const shop = await Shop.findOne({ where: { shop_name: shopName } });
  if (!shop) {
    return next(new AppError('Shop not found', 404));
  }

  await shop.destroy();
  console.log(`Shop '${shopName}' has been deleted.`);

  await seller.destroy();
  console.log(`Seller '${user.Username}' has been deleted from the Sellers table.`);

  user.Role = 'User';
  await user.save();

  res.status(200).json({
    status: 'success',
    message: `Shop '${shopName}' and its items have been deleted successfully, seller has been removed from Sellers table, and user role updated to 'User'.`,
  });
});
exports.findAllShops = factory.getAll(Shop);
exports.updateShop = factory.updateOne(Shop);
exports.deleteShop = factory.deleteOne(Shop);
exports.createShop = createShop;
exports.deleteShop = deleteShop;
exports.closeShopTemporary = closeShopTemporary;










