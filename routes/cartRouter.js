const express = require('express');
const authController = require('./../controllers/authController');
const cartController = require('./../controllers/cartController');
const router = express.Router();

router.use(authController.protect);

router.post('/createOrUpdateCart', cartController.createOrUpdateCart);

router.delete('/deleteFromCart', cartController.deleteFromCart);

router.get('/getCart', cartController.getCart);

module.exports = router;
