const express = require('express');
const authController = require('./../controllers/authController');
const buyRequests = require('./../controllers/buyReuqestsController');
const router = express.Router();


router.use(authController.protect);

router.post('/requests', buyRequests.createRequest);

router.get('/requests/:userId', buyRequests.getRequestsForUser);

router.patch('/requests/:requestId', buyRequests.updateRequestStatus);

module.exports = router;

