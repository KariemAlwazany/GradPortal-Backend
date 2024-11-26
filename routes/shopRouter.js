const express = require('express');
const shopController = require('./../controllers/shopController');
const authController = require('./../controllers/authController');
//const { use } = require('./shopRouter');

const router = express.Router();

router.use(authController.protect);

  
router.get('/findAllShops', shopController.findAllShops);


router.patch('/updateShop', shopController.updateShop);
    
router.delete('/deleteShop', shopController.deleteShop);

router.post('/createShop', shopController.createShop);

module.exports = router;


