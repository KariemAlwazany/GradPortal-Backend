const express = require('express');
const removePartnerController = require('./../controllers/removePartnerController');
const authController = require('./../controllers/authController');

const router = express.Router();
router.use(authController.protect);

router.post('/', removePartnerController.postRequest);
router.get('/', removePartnerController.getRequests);
router.get('/status', removePartnerController.getStatus);
router.get('/message', removePartnerController.getDoctorMessage);

router.post(
  '/doctor/message/:id',
  removePartnerController.sendMessageToStudent,
);

router.get('/:id/partnerInfo', removePartnerController.getPartnerInfo);
router.patch('/:id/accept', removePartnerController.acceptRequest);
router.patch('/:id/decline', removePartnerController.declineRequest);
module.exports = router;
