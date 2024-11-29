const express = require('express');
const tableController = require('./../controllers/tableController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.post('/', tableController.createTable);
router.get('/', tableController.getTable);
module.exports = router;
