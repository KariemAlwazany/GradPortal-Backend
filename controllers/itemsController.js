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
    return res.status(404).json({ message: 'No Items found' });  // Updated message here
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

const getSellerItemsByCategory = catchAsync(async (req, res, next) => {
  const userID = req.user.id;
  const user = await User.findOne({ where: { id: userID } });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const username = user.Username;
  const seller = await Sellers.findOne({ where: { Username: username } });
  if (!seller) {
    return res.status(404).json({ message: 'Seller not found' });
  }

  const { Shop_name } = seller;
  const { category } = req.body;
  if (!category) {
    return res.status(400).json({ message: 'Category is required' });
  }
  const items = await Items.findAll({
    where: {
      shop_name: Shop_name,
      category: category, 
    },
  });

  if (items.length === 0) {
    return res.status(404).json({ message: 'No items found in this category' });  
  }

  const itemsWithPictures = items.map(item => {
    const itemData = item.toJSON(); 
    
    if (itemData.Picture) {
      itemData.Picture = itemData.Picture.toString('base64');  
    }

    return itemData;
  });
  return res.status(200).json({ items: itemsWithPictures });
});


const getItemsByCategory = catchAsync(async (req, res, next) => {
  const { Category } = req.query; // Using 'req.query' to get the category from the URL

  if (!Category) {
    return res.status(400).json({ message: 'Category is required' });
  }

  // Fetch only available items from the specified category
  const items = await Items.findAll({
    where: {
      category: Category, // Use the 'Category' from the query parameter
      Available: true, // Only fetch available items
    },
  });

  if (items.length === 0) {
    return res.status(404).json({ message: 'No available items found in this category' });
  }

  // Process and return the items
  const itemsWithPictures = items.map(item => {
    const itemData = item.toJSON();
    
    if (itemData.Picture) {
      itemData.Picture = itemData.Picture.toString('base64');
    }

    return {
      Item_ID: itemData.id,
      item_name: itemData.item_name,
      Description: itemData.Description,
      Price: itemData.Price,
      Available: itemData.Available,
      Quantity: itemData.Quantity,
      Category: itemData.category,
      Type: itemData.Type,
      Picture: itemData.Picture,
    };
  });

  res.status(200).json({
    message: 'Available items found in this category',
    items: itemsWithPictures,
  });
});






const getAllItems = catchAsync(async (req, res, next) => {
  // Step 1: Fetch only the items that are available from the Items table
  const items = await Items.findAll({
    where: { available: true },  // Only get items where 'available' is true
  });

  // Step 2: Check if there are any available items
  if (items.length === 0) {
    return res.status(404).json({ message: 'No available items found' });
  }

  // Step 3: Process each item and convert the image to Base64 (optional)
  const itemsWithPictures = items.map(item => {
    const itemData = item.toJSON(); // Convert Sequelize model instance to a plain object
    
    // Check if there is a picture and convert it to Base64 string (if needed)
    if (itemData.Picture) {
      itemData.Picture = itemData.Picture.toString('base64');  // Convert Buffer to Base64 string
    }

    return itemData;
  });

  // Step 4: Return the available items with the image data (as Base64)
  return res.status(200).json({
    message: 'Available items fetched successfully',
    items: itemsWithPictures,
  });
});


const updateItem = async (req, res) => {
  try {
    const { item_id } = req.params;  // Get the item ID from the route parameters
    const { item_name, Quantity, Price, Description, Type, Available, Category } = req.body;
    const { Username } = req.user;  // Assuming req.user is populated by JWT middleware

    // Validate if the item_id is provided
    if (!item_id) {
      return res.status(400).json({ message: 'Item ID is required' });
    }

    // Fetch the item from the database
    const item = await Items.findOne({ where: { Item_ID: item_id } });  // Ensure we're looking for the correct Item_ID

    // Check if the item exists
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Prepare the fields to be updated
    const updatedFields = {};

    // If the quantity is 0, set Available to false
    if (Quantity === 0) {
      updatedFields.Available = 0;  // Force Available to false when Quantity is 0
    }

    // Only update the fields that are provided in the request body
    if (item_name) updatedFields.item_name = item_name;
    if (Quantity !== undefined) updatedFields.Quantity = Quantity;  // Update Quantity if provided
    if (Price) updatedFields.Price = Price;
    if (Description) updatedFields.Description = Description;
    if (Type) updatedFields.Type = Type;
    if (Category) updatedFields.Category = Category;
    if (Available !== undefined) updatedFields.Available = Available === 'true'; // Convert Available to boolean if provided

    // Check if a new file (image) is uploaded in the request, if so, update the Picture field
    if (req.file) {
      updatedFields.Picture = req.file.buffer;  // Store the image buffer directly as BLOB
    }

    // If no fields were provided for updating, return a response saying so
    if (Object.keys(updatedFields).length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    // Update the item in the database with the new values
    await item.update(updatedFields);

    // Return the number of fields updated
    const updatedFieldCount = Object.keys(updatedFields).length;

    // Send the response
    res.status(200).json({
      message: `${updatedFieldCount} field(s) updated successfully`,  // Inform how many fields were updated
      item: item,
    });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



exports.findAllItems = factory.getAll(Items);
exports.deleteItems = factory.deleteOne(Items);
exports.getItemsByID = factory.getOne(Items);
exports.addItem = addItem;
exports.getItemsForSeller = getItemsForSeller;
exports.updateItem = updateItem;
exports.getSellerItemsByCategory = getSellerItemsByCategory;
exports.getItemsByCategory = getItemsByCategory;
exports.getAllItems = getAllItems