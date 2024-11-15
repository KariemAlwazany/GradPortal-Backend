const express = require('express');
const studentController = require('./../controllers/studentController');
const authController = require('./../controllers/authController');

const router = express.Router();
router.get('/:username', studentController.getStudent);

router.use(authController.protect);

router.get('/', studentController.getAllStudents);

router.get('/getCurrentStudent', studentController.getCurrentStudent);
module.exports = router;
