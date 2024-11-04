const express = require('express');
const meetingController = require('./../controllers/meetingController');
const authController = require('./../controllers/authController');

const router = express.Router();
router.use(authController.protect);
router.get('/', meetingController.getMyMeetings);
router.post('/', meetingController.studentCreateMeeting);
router.patch('/approve', meetingController.approve);
router.post('/decline', meetingController.decline);

module.exports = router;
