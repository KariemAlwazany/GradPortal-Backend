const express = require('express');
const doctorController = require('./../controllers/doctorController');
const authController = require('./../controllers/authController');
const studentController = require('./../controllers/studentController');

const router = express.Router();
router.get('/', doctorController.getAllDoctors);
router.get('/available', doctorController.getAllDoctors);

router.use(authController.protect);
router.get('/students', doctorController.getStudents);
router.get('/currentStudent', doctorController.CurrentStudent);
router.get('/current', doctorController.getCurrentDoctor);
router.get('/cur', doctorController.getCurrentStudent);
router.post('/transfer', doctorController.transfer);
module.exports = router;
