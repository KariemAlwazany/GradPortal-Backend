// notificationRoutes.js
const express = require('express');
const router = express.Router();
const Notification = require('../controllers/notificationController');
const authController = require('./../controllers/authController');

router.use(authController.protect);

router.post('/notifyUser', Notification.notifyUserById);

module.exports = router;
