const express = require('express');
const submitController = require('./../controllers/submitController');
const authController = require('./../controllers/authController');

const router = express.Router();
router.use(authController.protect);
router.post('/student', submitController.studentSubmit);
router.get('/student', submitController.getSubmission);
router.get('/doctor', submitController.getSubmissionsForDoctor);

module.exports = router;
