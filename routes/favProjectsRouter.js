const express = require('express');
const authController = require('./../controllers/authController');

const favProjectsController = require('./../controllers/favProjectsController');

const router = express.Router();
router.use(authController.protect);
router
  .get('/', favProjectsController.getMyFavProjects)
  .post('/', favProjectsController.addFav);
router.delete('/:projectId', favProjectsController.deleteFav);
module.exports = router;
