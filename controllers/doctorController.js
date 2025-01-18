const db = require('./../models/doctorModel');
const db1 = require('./../models/projectsModel');
const db2 = require('./../models/userModel');
const db3 = require('./../models/studentModel');
const db4 = require('./../models/reservationModel');
const db5 = require('./../models/manageModel');
const db6 = require('./../models/waitingPartnerModel');
const db7 = require('./../models/submitModel');
const db8 = require('./../models/tableModel');
const db9 = require('./../models/deadlinesModel');
const db10 = require('./../models/messagesModel');
const { Sequelize } = require('sequelize');
const catchAsync = require('./../utils/catchAsync');
const { WaitingList } = require('../models/waitingModel');
const Doctor = db.Doctor;
const Projects = db1.Projects;
const User = db2.User;
const Student = db3.Student;
const Reservation = db4.Reservation;
const Manage = db5.Manage;
const WaitingPartner = db6.WaitingPartner;
const Submit = db7.Submit;
const Table = db8.Table;
const Deadline = db9.Deadline;
const Messages = db10.Messages;
getAllDoctors = catchAsync(async (req, res, next) => {
  const allDoctors = await Doctor.findAll();

  res.status(200).send(allDoctors);
});
const getAvailableDoctors = catchAsync(async (req, res, next) => {
  const manage = await Manage.findOne({ where: {} });
  const number = manage.StudentNumber;

  const allDoctors = await Doctor.findAll({
    where: {
      Role: 'Doctor',
      StudentNumber: {
        [Sequelize.Op.lte]: number,
      },
    },
  });

  res.status(200).send(allDoctors);
});
const getUnAvailableDoctors = catchAsync(async (req, res, next) => {
  const manage = await Manage.findOne({ where: {} });
  const number = manage.StudentNumber;
  const allDoctors = await Doctor.findAll({
    where: {
      Role: 'Doctor',
      StudentNumber: {
        [Sequelize.Op.gt]: number,
      },
    },
  });

  res.status(200).send(allDoctors);
});
const getStudents = catchAsync(async (req, res, next) => {
  const userID = req.user.id;
  const user = await User.findOne({ where: { id: userID } });
  const username = user.Username;
  console.log(username);
  const allStudents = await Projects.findAll({
    where: {
      [Sequelize.Op.or]: [
        { Supervisor_1: username },
        { Supervisor_2: username },
      ],
      done: 'no',
    },
    include: [
      {
        model: Student,
        as: 'Student1',
        attributes: ['Username', 'Registration_number'],
        required: false,
      },
      {
        model: Student,
        as: 'Student2',
        attributes: ['Username', 'Registration_number'],
        required: false,
      },
    ],
  });

  // Log the result to inspect the output structure

  res.status(200).json({
    status: 'success',
    data: {
      allStudents,
    },
  });
});
const getCurrentDoctor = catchAsync(async (req, res, next) => {
  const userID = req.user.id;
  const user = await User.findOne({ where: { id: userID } });

  res.status(200).send(user);
});
const getCurrentStudent = catchAsync(async (req, res, next) => {
  console.log('**********************************************************');
  const userid = req.user.id;

  console.log('**********************************************************');
  const user = await User.findOne({ where: { id: userid } });
  res.status(200).send(user);
});
const CurrentStudent = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findOne({ where: { id: userId } });
  username = user.Username;
  const student = await Student.findOne({ where: { Username: username } });
  res.status(200).send(student);
});
const transfer = catchAsync(async (req, res, next) => {
  const { student, doctor } = req.body;
  const changeReservation = Reservation.update(
    { Doctor: doctor },
    { where: { Student: student } },
  );
  res.status(200).json({
    status: 'success',
    data: {
      changeReservation,
    },
  });
});

const getPartnerDoctor = catchAsync(async (req, res, next) => {
  const username = req.params.username;
  console.log('username', username);
  const list = await WaitingList.findOne({
    where: {
      Partner_1: username,
    },
  });
  console.log(list);
  const partnerDoctor = await Reservation.findOne({
    where: { Student: list.Partner_2 },
  });
  const doctorInfo = await Doctor.findOne({
    where: { Username: partnerDoctor.Doctor },
  });
  res.status(200).json({
    status: 'success',
    data: {
      doctorInfo,
    },
  });
});
const headDoctorChoosePartner = catchAsync(async (req, res, next) => {
  const { Partner_1, Partner_2 } = req.body;
  console.log(req.body);
  projectType = '';
  const getStudent = Student.findOne({ where: { Username: Partner_1 } });
  if (getStudent.BE == null) {
    projectType = 'Hardware';
  } else {
    projectType = 'Software';
  }
  await WaitingList.create({
    Partner_1: Partner_1,
    Partner_2: Partner_2,
    PartnerStatus: 'approved',
    ProjectType: projectType,
    ProjectStatus: 'waiting',
  });
  await WaitingList.create({
    Partner_1: Partner_2,
    Partner_2: Partner_1,
    PartnerStatus: 'approved',
    ProjectType: projectType,
    ProjectStatus: 'waiting',
  });
  await Student.update(
    { Status: 'approvedpartner' },
    { where: { Username: Partner_1 } },
  );
  await Student.update(
    { Status: 'approvedpartner' },
    { where: { Username: Partner_2 } },
  );
  const addToPartnerList = await WaitingPartner.create({
    Partner_1: Partner_1,
    Partner_2: Partner_2,
    PartnerStatus: 'approved',
  });

  res.status(200).json({
    status: 'success',
    data: {
      addToPartnerList,
    },
  });
});
const headDoctorChooseDoctor = catchAsync(async (req, res, next) => {
  const { username, doctor } = req.body;
  console.log(req.body);
  await Student.update(
    { Status: 'approveddoctor' },
    { where: { Username: username } },
  );
  await Reservation.create({
    Doctor: doctor,
    Student: username,
  });
  await WaitingList.update(
    {
      DoctorStatus: 'approved',
      Doctor1: doctor,
    },
    { where: { Partner_1: username } },
  );
  await Doctor.update(
    { StudentNumber: Sequelize.literal('StudentNumber + 1') },
    { where: { Username: doctor } },
  );

  res.status(200).json({
    status: 'success',
    data: {
      Message: 'Doctor has been choosed successfully',
    },
  });
});
const headDoctorResetApplication = catchAsync(async (req, res) => {
  await User.update({ Role: 'User' }, { where: { Role: 'Student' } });
  await WaitingList.destroy({ where: {} });
  await Doctor.update({ StudentNumber: 0 }, { where: {} });
  await Reservation.destroy({ where: {} });
  await WaitingPartner.destroy({ where: {} });
  await Submit.destroy({ where: {} });
  await Deadline.destroy({ where: {} });
  await Projects.update({ done: 'yes' }, { where: { done: 'no' } });
  await Messages.destroy({ where: {} });
  await Table.destroy({ where: {} });
  res.status(200).json({
    status: 'success',
    data: {
      Message: 'Application Reset Success',
    },
  });
});
module.exports = {
  getAllDoctors,
  getUnAvailableDoctors,
  getStudents,
  getCurrentDoctor,
  getCurrentStudent,
  CurrentStudent,
  transfer,
  getAvailableDoctors,
  getPartnerDoctor,
  headDoctorChoosePartner,
  headDoctorChooseDoctor,
  headDoctorResetApplication,
};
