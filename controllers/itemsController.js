const db = require('./../models/itemsModel');
const Items = require('./../models/itemsModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryController');
const Sellers = require('./../models/sellerModel');

const addItem = async (req, res) => {
    try {
      // Log incoming data for debugging
      console.log("Request Headers:", req.headers);
      console.log("Request Body:", req.body);
      console.log("Uploaded File:", req.file);
  
      const { item_name, Quantity, Price, Description, Type, Available } = req.body;
      const { Username } = req.user;
  
      // Validate required fields
      if (!item_name || !Quantity || !Description || !Type || !req.file) {
        return res.status(400).json({ message: 'All required fields must be provided' });
      }
  
      // Fetch Shop_name
      const shop = await Sellers.findOne({ where: { Username } });
      if (!shop || !shop.Shop_name) {
        return res.status(400).json({ message: 'No shop found for the logged-in user' });
      }
  
      const Shop_name = shop.Shop_name;
      const Picture = req.file.buffer; // Access file buffer
  
      // Create the item
      const newItem = await Items.create({
        item_name,
        Quantity,
        Price,
        Description,
        Type,
        Available: Available === 'true',
        Picture,
        Shop_name,
        Item_owner: Username,
      });
  
      res.status(201).json({
        message: 'Item uploaded successfully',
        item: newItem,
      });
    } catch (error) {
      console.error('Error uploading item:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  


exports.findAllItems = factory.getAll(Items);
exports.updateItems = factory.updateOne(Items);
exports.deleteItems = factory.deleteOne(Items);
exports.getItemsByID = factory.getOne(Items);
exports.addItem = addItem;
