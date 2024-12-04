const db = require('./../models/itemsModel');
const Items = require('./../models/itemsModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryController');
const Sellers = require('./../models/sellerModel');
const Users = require('./../models/userModel');
const jwt = require('jsonwebtoken'); // You need this to decode the JWT token
const db1 = require('./../models/userModel');
const User = db1.User;
const { Sequelize, Op } = require('sequelize'); // Import Sequelize and Op (operators) from sequelize



const addItem = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const { item_name, Quantity, Price, Description, Type, Available, Category } = req.body;
    const { Username } = req.user;
    if (!item_name || !Quantity || !Price || !Description || !Type || !Category) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const shop = await Sellers.findOne({ where: { Username } });
    if (!shop || !shop.Shop_name) {
      return res.status(400).json({ message: 'No shop found for the logged-in user' });
    }
    const Shop_name = shop.Shop_name;
    const Picture = req.file.buffer; 
    const newItem = await Items.create({
      item_name,
      Quantity,
      Price,
      Description,
      Category,
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





const getItemsForSeller = catchAsync(async (req, res, next) => {
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
  const items = await Items.findAll({ where: { shop_name: Shop_name } });

  if (items.length === 0) {
    return res.status(404).json({ message: 'No Items found' }); 
  }

  const itemsWithPictures = items.map(item => {
    const itemData = item.toJSON(); 
    if (itemData.Picture) {
      itemData.Picture = itemData.Picture.toString('base64');  
    }
    return itemData;
  });
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
  const { Category } = req.query;
  if (!Category) {
    return res.status(400).json({ message: 'Category is required' });
  }
  const items = await Items.findAll({
    where: {
      shop_name: Shop_name,
      category: Category, 
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
  const { Category } = req.query;

  if (!Category) {
    return res.status(400).json({ message: 'Category is required' });
  }
  const items = await Items.findAll({
    where: {
      category: Category,
      Available: true, 
    },
  });

  if (items.length === 0) {
    return res.status(404).json({ message: 'No available items found in this category' });
  }
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
  const items = await Items.findAll({
    where: { available: true },
  });
  if (items.length === 0) {
    return res.status(404).json({ message: 'No available items found' });
  }
  const itemsWithPictures = items.map(item => {
    const itemData = item.toJSON();
    if (itemData.Picture) {
      itemData.Picture = itemData.Picture.toString('base64');
    }
    return itemData;
  });

  return res.status(200).json({
    message: 'Available items fetched successfully',
    items: itemsWithPictures,
  });
});





const updateItem = async (req, res) => {
  try {
    const { item_id } = req.params; 
    const { item_name, Quantity, Price, Description, Type, Available, Category } = req.body;
    const { Username } = req.user; 
    if (!item_id) {
      return res.status(400).json({ message: 'Item ID is required' });
    }

    const item = await Items.findOne({ where: { Item_ID: item_id } });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    const updatedFields = {};

    if (Quantity === 0) {
      updatedFields.Available = 0;
    }
    if (item_name) updatedFields.item_name = item_name;
    if (Quantity !== undefined) updatedFields.Quantity = Quantity;  // Update Quantity if provided
    if (Price) updatedFields.Price = Price;
    if (Description) updatedFields.Description = Description;
    if (Type) updatedFields.Type = Type;
    if (Category) updatedFields.Category = Category;
    if (Available !== undefined) updatedFields.Available = Available === 'true';

    if (req.file) {
      updatedFields.Picture = req.file.buffer;
    }
    if (Object.keys(updatedFields).length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    await item.update(updatedFields);
    const updatedFieldCount = Object.keys(updatedFields).length;

    res.status(200).json({
      message: `${updatedFieldCount} field(s) updated successfully`,
      item: item,
    });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};





const searchItems = async (req, res) => {
  try {
    const searchQuery = req.query.item_name; // Get search query from the query parameters

    if (!searchQuery) {
      return res.status(400).json({ message: 'Search query cannot be empty' });
    }

    // Perform the search query using Sequelize
    const items = await Items.findAll({
      where: {
        item_name: {
          [Sequelize.Op.like]: `%${searchQuery}%`, // Use LIKE operator for searching
        },
      },
    });

    if (items.length === 0) {
      return res.status(404).json({ message: 'No items found' });
    }

    // Convert BLOB to Base64 string for Picture
    const itemsWithBase64Images = items.map(item => {
      let pictureBase64 = '';
      if (item.Picture) {
        pictureBase64 = item.Picture.toString('base64'); // Convert BLOB to Base64
      }

      return {
        ...item.toJSON(),  // Convert Sequelize instance to JSON
        Picture: pictureBase64, // Add Base64 encoded image
      };
    });

    res.status(200).json({ items: itemsWithBase64Images });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};




const searchItemsForSeller = catchAsync(async (req, res, next) => {
  const userID = req.user.id; // Get user ID from JWT token (decoded)
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
  const searchQuery = req.query.item_name; // Get search query from the query parameters

  if (!searchQuery) {
    return res.status(400).json({ message: 'Search query cannot be empty' });
  }

  // Perform the search query using Sequelize, limited to items for this seller
  const items = await Items.findAll({
    where: {
      shop_name: Shop_name,
      item_name: {
        [Sequelize.Op.like]: `%${searchQuery}%`, // Use LIKE operator for searching
      },
    },
  });

  if (items.length === 0) {
    return res.status(404).json({ message: 'No items found for the given search' });
  }

  // Process and convert BLOB images to base64
  const itemsWithPictures = items.map(item => {
    const itemData = item.toJSON(); // Convert Sequelize object to plain JSON
    if (itemData.Picture) {
      itemData.Picture = itemData.Picture.toString('base64'); // Convert image BLOB to base64 string
    }
    return itemData;
  });

  res.status(200).json({
    message: 'Items fetched successfully',
    items: itemsWithPictures,
  });
});

exports.findAllItems = factory.getAll(Items);
exports.deleteItems = factory.deleteOne(Items);
exports.getItemsByID = factory.getOne(Items);
exports.addItem = addItem;
exports.getItemsForSeller = getItemsForSeller;
exports.updateItem = updateItem;
exports.getSellerItemsByCategory = getSellerItemsByCategory;
exports.getItemsByCategory = getItemsByCategory;
exports.getAllItems = getAllItems;
exports.searchItems = searchItems;
exports.searchItemsForSeller = searchItemsForSeller;