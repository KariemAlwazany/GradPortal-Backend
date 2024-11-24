const db = require('./../models/doctorModel');
const db1 = require('./../models/projectsModel');
const db2 = require('./../models/userModel');
const db3 = require('./../models/studentModel');
const db4 = require('./../models/reservationModel');
const { Sequelize } = require('sequelize');
const catchAsync = require('./../utils/catchAsync');
const Doctor = db.Doctor;
const Projects = db1.Projects;
const User = db2.User;
const Student = db3.Student;
const Reservation = db4.Reservation;

getAllDoctors = catchAsync(async (req, res, next) => {
  const allDoctors = await Doctor.findAll();

  res.status(200).send(allDoctors);
});
const getStudents = catchAsync(async (req, res, next) => {
  const userID = req.user.id;
  const user = await User.findOne({ where: { id: userID } });
  const username = user.Username;

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
module.exports = {
  getAllDoctors,
  getStudents,
  getCurrentDoctor,
  getCurrentStudent,
  CurrentStudent,
  transfer,
};
