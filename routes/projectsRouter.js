const express = require('express');
const projectsController = require('./../controllers/projectsController');
const authController = require('./../controllers/authController');

const router = express.Router();
router.get('/', projectsController.getAllProjects);
router.get('/current', projectsController.getCurrentProjects);
router.get('/all/count', projectsController.getProjectsCount);
router.get('/software/count', projectsController.getSoftwareCount);
router.get('/hardware/count', projectsController.getHardwareCount);
router.get('/specific/:id', projectsController.getProjectDetails);
router.use(authController.protect);
router.get('/student', projectsController.getStudentProject);
module.exports = router;
