const db = require('./../models/itemsModel');
const Items = db.Shop;
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryController');


exports.findAllShops = factory.getAll(Shop);
exports.updateShop = factory.updateOne(Shop);
exports.deleteShop = factory.deleteOne(Shop);
