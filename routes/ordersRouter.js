const express = require('express');
const authController = require('./../controllers/authController');
const ordersController = require('./../controllers/ordersController');
const router = express.Router();

router.use(authController.protect);

router.post('/createOrder', ordersController.createOrder);
router.post('/checkoutOrder', ordersController.checkoutOrder);
router.post('/respondToOrder', ordersController.respondToOrder);

router.get('/getProfitData', ordersController.getProfitData);
router.get('/calculateProfit', ordersController.calculateProfit);
router.get('/getOrdersForSeller', ordersController.getOrdersForSeller);
router.get('/countPendingOrders', ordersController.countPendingOrders);
router.get('/countCompletedOrders', ordersController.countCompletedOrders);
router.get('/getCompletedOrdersForSeller', ordersController.getCompletedOrdersForSeller);
router.get('/getRejectedOrdersForSeller', ordersController.getRejectedOrdersForSeller);
router.get('/getCompletedOrdersForDelivery', ordersController.getCompletedOrdersForDelivery);
router.get('/getBuyerId', ordersController.getBuyerId);
router.get('/getBuyerPhoneNumber', ordersController.getBuyerPhoneNumber);

router.patch('/updateOrderStatus', ordersController.updateOrderStatus);
router.patch('/updateOrderStatusToDelivering', ordersController.updateOrderStatusToDelivering);

module.exports = router;




