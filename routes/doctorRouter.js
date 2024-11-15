const express = require('express');
const doctorController = require('./../controllers/doctorController');
const authController = require('./../controllers/authController');

const router = express.Router();
router.get('/', doctorController.getAllDoctors);
router.use(authController.protect);
router.get('/students', doctorController.getStudents);
module.exports = router;
