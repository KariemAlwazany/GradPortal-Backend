const express = require('express');
const deadlineController = require('./../controllers/deadlineController');
const authController = require('./../controllers/authController');

const router = express.Router();
router.use(authController.protect);
router.get('/student/deadlines', deadlineController.getStudentDeadlines);
router.get('/doctor/deadlines', deadlineController.getDoctorDeadlines);
router.post('/doctor/deadlines', deadlineController.postDoctorDeadlines);
router.patch('/doctor/deadlines', deadlineController.updateDeadline);
router.delete('/doctor/deadlines', deadlineController.deleteDeadline);
module.exports = router;
