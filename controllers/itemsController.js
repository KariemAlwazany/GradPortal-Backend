const db = require('./../models/itemsModel');
const Items = require('./../models/itemsModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryController');
const Sellers = require('./../models/sellerModel');
const Users = require('./../models/userModel');
const jwt = require('jsonwebtoken'); // You need this to decode the JWT token
const db1 = require('./../models/userModel');
const User = db1.User;

const addItem = async (req, res) => {
  try {
    // Check if a file is present
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { item_name, Quantity, Price, Description, Type, Available, Category } = req.body;
    const { Username } = req.user;  // Assuming req.user is populated by JWT middleware

    // Validate required fields
    if (!item_name || !Quantity || !Price || !Description || !Type || !Category) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Validate if the user has a corresponding shop (seller)
    const shop = await Sellers.findOne({ where: { Username } });
    if (!shop || !shop.Shop_name) {
      return res.status(400).json({ message: 'No shop found for the logged-in user' });
    }

    const Shop_name = shop.Shop_name;

    // Convert the buffer to binary (BLOB) and store it as is
    const Picture = req.file.buffer;  // This keeps the file as a buffer (binary data)

    // Create a new item and save to the database
    const newItem = await Items.create({
      item_name,
      Quantity,
      Price,
      Description,
      Category,
      Type,
      Available: Available === 'true',  // Assuming Available is a string 'true' or 'false'
      Picture,  // Store the image buffer directly as BLOB
      Shop_name,
      Item_owner: Username,
    });

    // Send the response
    res.status(201).json({
      message: 'Item uploaded successfully',
      item: newItem,
    });
  } catch (error) {
    console.error('Error uploading item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const getItemsForSeller = catchAsync(async (req, res, next) => {
  // Step 1: Get the current user ID from the JWT token (which is passed through req.user)
  const userID = req.user.id;

  // Step 2: Fetch the user from the Users table using the userID
  const user = await User.findOne({ where: { id: userID } });

  // Ensure the user exists
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const username = user.Username;

  // Step 3: Find the corresponding seller in the Sellers table using the username
  const seller = await Sellers.findOne({ where: { Username: username } });

  // Ensure the seller exists
  if (!seller) {
    return res.status(404).json({ message: 'Seller not found' });
  }

  const { Shop_name } = seller;

  // Step 4: Find all items that belong to the seller's shop (using the shop_name)
  const items = await Items.findAll({ where: { shop_name: Shop_name } });

  // Step 5: Check if there are any items
  if (items.length === 0) {
    return res.status(404).json({ message: 'No items found for this seller' });
  }

  // Step 6: Process each item and convert the image to Base64 (optional)
  const itemsWithPictures = items.map(item => {
    const itemData = item.toJSON(); // Convert Sequelize model instance to a plain object
    
    // Check if there is a picture and convert it to Base64 string (if needed)
    if (itemData.Picture) {
      itemData.Picture = itemData.Picture.toString('base64');  // Convert Buffer to Base64 string
    }

    return itemData;
  });

  // Step 7: Return the items along with the image data (as Base64)
  res.status(200).json({
    message: 'Items fetched successfully',
    items: itemsWithPictures,
  });
});



exports.findAllItems = factory.getAll(Items);
exports.updateItems = factory.updateOne(Items);
exports.deleteItems = factory.deleteOne(Items);
exports.getItemsByID = factory.getOne(Items);
exports.addItem = addItem;
exports.getItemsForSeller = getItemsForSeller;
