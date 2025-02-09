const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const manageController = require('./../controllers/manageController');
const router = express.Router();

router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/changePassword', authController.changePassword);
router.patch('/updatePhoneNumber', userController.updatePhoneNumber);
router.patch('/updateUserLocation', userController.updateUserLocation);
router.post('/signup', manageController.checkJoin, authController.signup);
router.use(authController.protect);
//for the notifications
router.post('/updateToken', userController.updateToken);
//for the notifications

router.patch('/updatePassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);
router.patch('/updateUsers', userController.updateUsers);

// router.use(authController.restrictTo('admin'));
router.get('/search', userController.searchUsers);
router.get('/', userController.getAllUsers);
router.get('/doctors', userController.getDoctors);
router.get('/doctors/count', userController.getDoctorsCount);
router.get('/students/count', userController.getStudentsCount);
router.get('/sellers/count', userController.getSellersCount);
router.get('/normal/count', userController.getNormalUserCount);
router.get('/headdoctor', userController.getHeadDoctor);
router.patch('/change-head', userController.changeHeadDoctor);
router.delete('/username/:Username', userController.deleteUserByUserName);
router.get('/username/:Username', userController.getByUsername);
router.get('/:id', userController.getUser);


router.patch('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
