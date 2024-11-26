const express = require('express');
const adminController = require('./../controllers/adminController');
const authController = require('./../controllers/authController');

const router = express.Router();
router.use(authController.protect);
router.get('/doctors', adminController.getDoctors);
router.get('/students', adminController.getStudents);
router.get('/sellers', adminController.getSellers);
router.post('/approve', adminController.approve);
router.post('/decline', adminController.decline);
module.exports = router;
