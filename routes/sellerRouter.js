const express = require('express');
const sellerController = require('./../controllers/sellerController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.route('/:id')
  .get(sellerController.getSellerByID);
  
router.get('/getAllSellers', sellerController.findAllSellers);

router.route('/updateSeller/:id')
    .patch(sellerController.updateSeller);
    
router.route('/deleteSeller/:id')
    .delete(sellerController.deleteSeller);

router.route('/getName/:Username')
  .get(sellerController.getSellerByName);

module.exports = router;


