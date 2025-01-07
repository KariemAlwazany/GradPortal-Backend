const express = require('express');
const shopController = require('./../controllers/shopController');
const authController = require('./../controllers/authController');
//const { use } = require('./shopRouter');

const router = express.Router();

router.use(authController.protect);
  
router.get('/getAllShops', shopController.getAllShops);
router.get('/getShopItems', shopController.getShopItems);

router.patch('/updateShop', shopController.updateShop);
router.patch('/closeShopTemporary', shopController.closeShopTemporary);
   
router.delete('/deleteShop', shopController.deleteShop);

router.post('/createShop', shopController.createShop);

module.exports = router;


