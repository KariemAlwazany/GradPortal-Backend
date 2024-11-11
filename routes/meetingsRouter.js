const express = require('express');
const meetingController = require('./../controllers/meetingController');
const authController = require('./../controllers/authController');

const router = express.Router();
router.use(authController.protect);
router.get('/', meetingController.getWaitingListMeeting);
router.post('/', meetingController.studentCreateMeeting);
router.patch('/approve', meetingController.approve);
router.post('/decline', meetingController.decline);
router.get('/myMeetings', meetingController.getMyMeetings);
router.patch('/addID', meetingController.addMeetingID);
router.patch('/endMeeting', meetingController.endMeeting);
router.get('/students/myMeetings', meetingController.getStudentMeetings);

module.exports = router;
