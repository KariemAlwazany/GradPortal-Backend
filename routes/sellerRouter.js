const express = require('express');
const sellerController = require('./../controllers/sellerController');
const authController = require('./../controllers/authController');
const { use } = require('./itemsRouter');

const router = express.Router();

router.use(authController.protect);

  
router.get('/getAllSellers', sellerController.findAllSellers);


router.patch('/updateSeller', sellerController.updateSellerAndUser);
    
router.route('/deleteSeller/:id')
    .delete(sellerController.deleteSeller);

router.get('/profile', sellerController.getCurrentSeller);
router.get('/role', sellerController.getAllSellerData);

module.exports = router;


