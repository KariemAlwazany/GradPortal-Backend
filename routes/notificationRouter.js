// notificationRoutes.js
const express = require('express');
const router = express.Router();
const Notification = require('../controllers/notificationController');
const authController = require('./../controllers/authController');

router.use(authController.protect);

router.post('/notifyUser', Notification.notifyUserById);
router.post('/notifyUserByUsername', Notification.notifyUserByUsername);

router.post('/student/notifyDoctor', Notification.notifyDoctor);

router.post(
  '/student/request/notifyDoctor',
  Notification.notifyDoctorforNewRequest,
);
router.post('/notifyDoctors', Notification.notifyAllDoctors);

router.post('/doctor/notifyStudents', Notification.notifyAllStudents);
router.post('/doctor/notifyMyStudents', Notification.notifyMyStudents);
router.post('/doctor/notifyGroup/:groupID', Notification.notifyGroup);
router.post('/adminsAndHeads', Notification.notifyAdminsAndHeads);
router.post('/:notificationId/markAsRead', Notification.markNotificationAsRead);

router.get('/:userId', Notification.getNotificationsByUser);
router.get('/:userId/count', Notification.getNotificationCountByUser);

module.exports = router;
