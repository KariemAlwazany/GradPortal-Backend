const express = require('express');
const doctorController = require('./../controllers/doctorController');
const authController = require('./../controllers/authController');
const studentController = require('./../controllers/studentController');

const router = express.Router();
router.get('/', doctorController.getAllDoctors);
router.get('/available', doctorController.getAvailableDoctors);
router.get('/unavailable', doctorController.getUnAvailableDoctors);

router.use(authController.protect);
router.get('/students', doctorController.getStudents);
router.get('/currentStudent', doctorController.CurrentStudent);
router.get('/current', doctorController.getCurrentDoctor);
router.get('/cur', doctorController.getCurrentStudent);
router.post('/transfer', doctorController.transfer);
router.get('/partner/:username', doctorController.getPartnerDoctor);
router.post(
  '/headDoctor/choose-partner',
  doctorController.headDoctorChoosePartner,
);
router.post(
  '/headDoctor/choose-doctor',
  doctorController.headDoctorChooseDoctor,
);
router.post('/headDoctor/resetApp', doctorController.headDoctorChooseDoctor);
module.exports = router;
