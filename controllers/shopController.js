const factory = require('./factoryController');
const Shop = require('./../models/shopModel'); 
const Sellers = require('./../models/sellerModel');

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
  
exports.findAllShops = factory.getAll(Shop);
exports.updateShop = factory.updateOne(Shop);
exports.deleteShop = factory.deleteOne(Shop);
exports.createShop = createShop;












