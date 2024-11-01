const express = require('express');
const doctorController = require('./../controllers/doctorController');
const authController = require('./../controllers/authController');

const router = express.Router();
router.get('/', doctorController.getAllDoctors);
module.exports = router;
