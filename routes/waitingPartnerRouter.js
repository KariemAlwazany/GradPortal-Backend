const express = require('express');
const waitingPartnerController = require('./../controllers/waitingPartnerController');
const authController = require('./../controllers/authController');

const router = express.Router();
router.use(authController.protect);
router.post('/', waitingPartnerController.addToList);
router.get('/getCurrent', waitingPartnerController.getCurrent);
router.get('/status', waitingPartnerController.getStatus);
router.post('/approve', waitingPartnerController.approve);
router.post('/decline', waitingPartnerController.decline);
module.exports = router;
