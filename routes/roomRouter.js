const express = require('express');
const roomController = require('./../controllers/roomController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.use(authController.protect);
router.post('/', roomController.createRoom);
router.get('/', roomController.getRooms);
router.patch('/:id', roomController.updateRoom);
router.delete('/:id', roomController.deleteRoom);

module.exports = router;
