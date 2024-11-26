const db = require('./../models/waitingPartnerModel');
const catchAsync = require('./../utils/catchAsync');
const studentController = require('./../controllers/studentController');
const db2 = require('./../models/studentModel');
const db3 = require('./../models/userModel');
const { Sequelize } = require('sequelize');
const { WaitingList } = require('../models/waitingModel');
const Student = db2.Student;
const User = db3.User;
const WaitingPartner = db.WaitingPartner;

const addToList = catchAsync(async (req, res, next) => {
  const { Partner_2 } = req.body;
  const userId = req.user.id;
  const user = await User.findOne({ where: { id: userId } });
  const username = user.Username;

  const newRequest = await WaitingPartner.create({
    Partner_1: username,
    Partner_2: Partner_2,
    PartnerStatus: 'waiting',
  });

  await Student.update(
    { Status: 'waitpartner' },
    { where: { Username: username } },
  );

  res.status(200).json({
    status: 'success',
    data: { newRequest },
  });
});

const getCurrent = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findOne({ where: { id: userId } });
  const username = user.Username;
  console.log(username);
  const partnerRequest = await WaitingPartner.findOne({
    where: { PartnerStatus: 'waiting', Partner_2: username },
  });
  console.log(partnerRequest);
  res.status(200).json({
    status: 'success',
    data: { partnerRequest },
  });
});

const getStatus = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findOne({ where: { id: userId } });
  const username = user.Username;

  const status = await WaitingPartner.findOne({
    where: { Partner_1: username },
  });

  res.status(200).json({
    status: 'success',
    data: { status },
  });
});

const approve = catchAsync(async (req, res, next) => {
  const { Partner_1 } = req.body;
  const userId = req.user.id;
  const user = await User.findOne({ where: { id: userId } });
  const Partner_2 = user.Username;

  const list = await WaitingPartner.update(
    { PartnerStatus: 'approved' },
    { where: { Partner_1: Partner_1, Partner_2: Partner_2 } },
  );

  await Student.update(
    { Status: 'approvedpartner' },
    { where: { Username: Partner_1 } },
  );

  const create = await WaitingList.create({
    Partner_1: Partner_2,
    Partner_2: Partner_1,
    Doctor1: 'waiting',
    ProjectType: 'waiting',
    ProjectStatus: 'waiting',
    PartnerStatus: 'approved',
    DoctorStatus: 'waiting',
  });

  res.status(200).json({
    status: create,
    message: 'Partner approved successfully',
  });
});

const decline = catchAsync(async (req, res, next) => {
  const { Partner_1 } = req.body;
  const userId = req.user.id;
  const user = await User.findOne({ where: { id: userId } });
  const Partner_2 = user.Username;

  await WaitingPartner.update(
    { PartnerStatus: 'declined' },
    { where: { Partner_1: Partner_1, Partner_2: Partner_2 } },
  );

  await Student.update(
    { Status: 'declinedpartner' },
    { where: { Username: Partner_1 } },
  );

  res.status(200).json({
    status: 'success',
    message: 'Partner declined successfully',
  });
});

module.exports = { addToList, getCurrent, getStatus, approve, decline };
