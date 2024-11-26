const express = require('express');
const studentController = require('../controllers/studentController');
const authController = require('../controllers/authController');

const router = express.Router();
router.get('/all', studentController.getAll);
router.get('/specific/:username', studentController.getStudent);
router.use(authController.protect);
router.get('/getCurrentStudent', studentController.CurrentStudent);
router.get('/', studentController.getAllStudents);

module.exports = router;
