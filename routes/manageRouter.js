const express = require('express');
const manageController = require('./../controllers/manageController');
const authController = require('./../controllers/authController');

const router = express.Router();
router.patch('/', manageController.update);
router.get('/', manageController.fetchDates);
module.exports = router;
