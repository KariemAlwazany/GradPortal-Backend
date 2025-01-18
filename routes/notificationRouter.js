// notificationRoutes.js
const express = require('express');
const router = express.Router();
const Notification = require('../controllers/notificationController');
const authController = require('./../controllers/authController');

router.use(authController.protect);

router.post('/notifyUser', Notification.notifyUserById);
router.post('/:notificationId/markAsRead', Notification.markNotificationAsRead);

router.get('/:userId', Notification.getNotificationsByUser);
router.get('/:userId/count', Notification.getNotificationCountByUser);

module.exports = router;
