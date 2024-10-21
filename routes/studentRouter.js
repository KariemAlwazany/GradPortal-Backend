const express = require('express');
const studentController = require('./../controllers/studentController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.use(authController.protect);
router.get('/getCurrentStudent', studentController.getCurrentStudent);
module.exports = router;
