const express = require('express');
const messageController = require('./../controllers/messagesController');
const authController = require('./../controllers/authController');

const router = express.Router();
router.use(authController.protect);
// router.get('/student', messageController.getStudents);
router.post('/', messageController.sendMessage);
router.get('/students', messageController.getStudentMessage);
router.get('/doctors', messageController.getDoctorMessage);
router.get('/doctors/me', messageController.getMessagesSentByMe);
router.patch('/', messageController.updateMessage);
router.delete('/', messageController.deleteMessage);

module.exports = router;
