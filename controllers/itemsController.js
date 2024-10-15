const db = require('./../models/itemsModel');
const Items = db.Items;
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryController');


exports.findAllItems = factory.getAll(Items);
exports.addItems = factory.createOne(Items);
exports.updateItems = factory.updateOne(Items);
exports.deleteItems = factory.deleteOne(Items);
exports.getItemsByID = factory.getOne(Items);