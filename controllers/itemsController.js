const db = require('./../models/itemsModel');
const Items = db.Items;
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryController');

const addItem = async (req, res) => {
    try {
        // Retrieve item data from the request body
        const { item_name, Quantity, Price, Description, Type, Available, Shop_name } = req.body;
        
        // Retrieve the image from the request file (using Multer)
        const Picture = req.file ? req.file.buffer : null; // Set buffer for BLOB field or path if using STRING
        
        // Ensure the Shop exists
        const shop = await Sellers.findOne({ where: { Shop_name } });
        if (!shop) {
            return res.status(400).json({ message: 'Invalid Shop_name, shop not found' });
        }

        // Create the item in the database
        const newItem = await Items.create({
            item_name,
            Quantity,
            Price,
            Description,
            Type,
            Available: Available === 'true', // Convert to boolean if received as string
            Picture,
            Shop_name, // Foreign key
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
