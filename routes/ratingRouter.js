const express = require('express');
const authController = require('./../controllers/authController');
const ratingController = require('./../controllers/ratingController');

const router = express.Router();
router.use(authController.protect);

router.post('/addOrUpdate', ratingController.addOrUpdateRating);

router.get('/getItemRating/:item_id', ratingController.getRatingsForItem);
router.get('/average/:item_id', ratingController.getAverageRating);

module.exports = router;

