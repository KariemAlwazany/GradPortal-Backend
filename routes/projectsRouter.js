const express = require('express');
const projectsController = require('./../controllers/projectsController');
const authController = require('./../controllers/authController');

const router = express.Router();
router.get('/', projectsController.getAllProjects);
router.get('/current', projectsController.getCurrentProjects);
module.exports = router;
