const express = require('express');
const waitingPartnerController = require('./../controllers/waitingPartnerController');
const authController = require('./../controllers/authController');
const manageController = require('./../controllers/manageController');
const router = express.Router();
router.use(authController.protect);
router.use(manageController.checkFindPartner);
router.post('/', waitingPartnerController.addToList);
router.get('/getCurrent', waitingPartnerController.getCurrent);
router.get('/status', waitingPartnerController.getStatus);
router.post('/approve', waitingPartnerController.approve);
router.post('/decline', waitingPartnerController.decline);
router.get(
  '/getParnterRequestedInfo/:Username',
  waitingPartnerController.getParnterRequestedInfo,
);
module.exports = router;
