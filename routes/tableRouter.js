const express = require('express');
const tableController = require('./../controllers/tableController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.post('/', tableController.createTable);
router.get('/', tableController.getTable);
router.get('/student', tableController.getTableForStudent);
router.get('/doctor', tableController.getTableForDoctor);
router.patch('/:id', tableController.updateTable);
router.post('/doctors', tableController.postForDoctors);
router.post('/students', tableController.postForStudent);
module.exports = router;
