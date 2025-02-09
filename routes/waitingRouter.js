const express = require('express');
const waitingController = require('./../controllers/waitingController');
const authController = require('./../controllers/authController');
const manageController = require('./../controllers/manageController');
const router = express.Router();
router.post('/doctors', waitingController.acceptOneOfThree);

router.use(authController.protect);
router.post('/doctors', waitingController.acceptOneOfThree);

router.get('/doctors', waitingController.getThreeDoctors);
router.patch('/projectSelected', waitingController.projectSelected);
router.patch('/informationEntered', waitingController.infromationEntered);

router.post('/', waitingController.addToWaiting);
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
router.get(
  '/declined-doctor-list/:username',
  waitingController.getDeclinedDoctorList,
);

router.post('/student/approve', waitingController.approveStudent);
router.post('/student/decline', waitingController.declineStudent);
router.post('/project/approve', waitingController.approveProject);
router.post('/project/decline', waitingController.declineProject);

router.post('/doctor/undo-request', waitingController.undoDoctorRequest);
router.post('/partner/undo-request', waitingController.undoPartnerRequest);
router.post('/project/undo-request', waitingController.undoProjectRequest);

router.patch(
  '/current',
  manageController.checkFindDoctor,
  waitingController.updateWaiting,
);

module.exports = router;
