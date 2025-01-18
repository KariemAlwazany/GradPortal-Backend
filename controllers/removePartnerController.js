const db2 = require('./../models/removePartnerModel');
const db = require('./../models/userModel');

const db3 = require('./../models/studentModel');

const db6 = require('./../models/waitingPartnerModel');

const db8 = require('./../models/submitModel');
const { Sequelize } = require('sequelize');
const catchAsync = require('./../utils/catchAsync');
const { WaitingList } = require('../models/waitingModel');

const Student = db3.Student;
const User = db.User;
const WaitingPartner = db6.WaitingPartner;

const RemovePartner = db2.RemovePartner;

const Submit = db8.Submit;
const postRequest = catchAsync(async (req, res, next) => {
  const { message } = req.body;
  const userId = req.user.id;
  const user = await User.findOne({ where: { id: userId } });
  const newRequest = await RemovePartner.create({
    Student: user.Username,
    StudentMessage: message,
  });
  res.status(201).json({
    status: 'success',
    data: newRequest,
  });
});
const getRequests = catchAsync(async (req, res) => {
  const requests = await RemovePartner.findAll({
    where: {
      Status: {
        [Sequelize.Op.ne]: 'Declined',
      },
    },
  });

  res.status(200).json({
    status: 'success',
    data: requests,
  });
});

const acceptRequest = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  const getRequest = await RemovePartner.findOne({ where: { id: id } });
  const findPartner = await WaitingPartner.findOne({
    where: {
      [Sequelize.Op.or]: [
        { Partner_1: getRequest.Student },
        { Partner_2: getRequest.Student },
      ],
      Status: 'approved',
    },
  });
  await Student.update(
    { Status: 'start' },
    {
      where: {
        [Sequelize.Op.or]: [
          { Username: findPartner.Partner_1 },
          { Username: findPartner.Partner_2 },
        ],
      },
    },
  );
  findPartner.Status = 'removedPartner';
  await findPartner.save();
  await WaitingList.update(
    { PartnerStatus: 'removed' },
    {
      where: {
        [Sequelize.Op.and]: [
          { Partner_1: findPartner.Partner_1 },
          { Partner_2: findPartner.Partner_2 },
        ],
      },
    },
  );
  await WaitingList.update(
    { PartnerStatus: 'removed' },
    {
      where: {
        [Sequelize.Op.and]: [
          { Partner_2: findPartner.Partner_1 },
          { Partner_1: findPartner.Partner_2 },
        ],
      },
    },
  );
  await WaitingPartner.update(
    { PartnerStatus: 'removed' },
    {
      where: {
        [Sequelize.Op.or]: [
          {
            [Sequelize.Op.and]: [
              { Partner_2: findPartner.Partner_1 },
              { Partner_1: findPartner.Partner_2 },
            ],
          },
          {
            [Sequelize.Op.and]: [
              { Partner_1: findPartner.Partner_1 },
              { Partner_2: findPartner.Partner_2 },
            ],
          },
        ],
      },
    },
  );
  await Submit.destroy({
    where: {
      [Sequelize.Op.or]: [
        { Student: findPartner.Partner_1 },
        { Student: findPartner.Partner_2 },
      ],
    },
  });

  await RemovePartner.update(
    { Status: 'Accepted', DoctorMessage: message },
    { where: { id: id } },
  );

  res.status(200).json({
    status: 'success',
    message: 'Request accepted',
  });
});

const declineRequest = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  await RemovePartner.update(
    { Status: 'Declined', Message: message },
    { where: { id: id } },
  );
  res.status(200).json({
    status: 'success',
    message: 'Request declined',
  });
});
const getPartnerInfo = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Fetch the RemovePartner request by ID
  const request = await RemovePartner.findOne({ where: { id: id } });

  if (!request) {
    return res.status(404).json({
      status: 'error',
      message: 'Request not found',
    });
  }

  // Find the partner information
  const findPartner = await WaitingPartner.findOne({
    where: {
      [Sequelize.Op.or]: [
        { Partner_1: request.Student },
        { Partner_2: request.Student },
      ],
      PartnerStatus: 'approved',
    },
  });

  if (!findPartner) {
    return res.status(404).json({
      status: 'error',
      message: 'Partner not found',
    });
  }

  // Determine the partner username
  let partnerUsername = '';
  if (findPartner.Partner_1 !== request.Student) {
    partnerUsername = findPartner.Partner_1;
  } else {
    partnerUsername = findPartner.Partner_2;
  }

  // Fetch the partner's information
  const partnerInfo = await Student.findOne({
    where: { Username: partnerUsername },
  });

  if (!partnerInfo) {
    return res.status(404).json({
      status: 'error',
      message: 'Partner information not found',
    });
  }

  res.status(200).json({
    status: 'success',
    data: partnerInfo,
  });
});
const sendMessageToStudent = catchAsync(async (req, res) => {
  const id = req.params.id;
  const { message } = req.body;
  await RemovePartner.update({ DoctorMessage: message }, { where: { id } });
  res.status(200).json({
    status: 'success',
    message: 'Message sent',
  });
});
const getStatus = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const user = await User.findOne({ where: { id: userId } });
  const request = await RemovePartner.findOne({
    where: { Student: user.Username },
  });
  if (request) {
    res.status(200).json({ status: request.Status });
  } else {
    res.status(404).json({ status: 'Request not found' });
  }
});

const getDoctorMessage = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const user = await User.findOne({ where: { id: userId } });
  const request = await RemovePartner.findOne({
    where: { Student: user.Username },
  });
  if (request) {
    res.status(200).json({ message: request.DoctorMessage });
  } else {
    res.status(404).json({ status: 'Request not found' });
  }
});
module.exports = {
  getRequests,
  acceptRequest,
  declineRequest,
  postRequest,
  getPartnerInfo,
  sendMessageToStudent,
  getStatus,
  getDoctorMessage,
};
