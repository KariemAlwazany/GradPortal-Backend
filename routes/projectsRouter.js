const express = require('express');
const projectsController = require('./../controllers/projectsController');
const authController = require('./../controllers/authController');

const router = express.Router();
router.get('/', projectsController.getAllProjects);
module.exports = router;
