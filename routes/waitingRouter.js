const express = require('express');
const waitingController = require('./../controllers/waitingController');
const authController = require('./../controllers/authController');

const router = express.Router();
router.post('/doctors', waitingController.acceptOneOfThree);

router.get('/doctors', waitingController.getThreeDoctors);
router.use(authController.protect);
router.post('/', waitingController.addToWaiting);
router.patch('/current', waitingController.updateWaiting);
router.get('/getCurrent', waitingController.getListForCurrentStudent);
router.get(
  '/getCurrent/doctor-list',
  waitingController.getListForCurrentDoctor,
);
router.get(
  '/getCurrent/project-list',
  waitingController.getProjectListForCurrentDoctor,
);
router.get('/studnet/count', waitingController.getCount);
router.get('/projects/count', waitingController.getCount);

router.post('/student/approve', waitingController.approveStudent);
router.post('/student/decline', waitingController.declineStudent);
router.post('/project/approve', waitingController.approveProject);
router.post('/project/decline', waitingController.declineProject);

module.exports = router;
