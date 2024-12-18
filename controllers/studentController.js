const db = require('./../models/studentModel');
const db1 = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const { Sequelize } = require('sequelize');
const Student = db.Student;
const User = db1.User;
const getAll = catchAsync(async (req, res, next) => {
  const students = await Student.findAll();
  res.status(200).json({
    status: 'success',
    data: {
      students,
    },
  });
});
const CurrentStudent = catchAsync(async (req, res, next) => {
  console.log('************************************************');
  const userId = req.user.id;
  const user = await User.findOne({ where: { id: userId } });
  username = user.Username;
  const student = await Student.findOne({ where: { Username: username } });
  res.status(200).send(student);
});
const getStudent = catchAsync(async (req, res, next) => {
  const username = req.params.username;
  const student = await Student.findOne({ where: { Username: username } });
  res.status(200).send(student);
});

const getAllStudents = catchAsync(async (req, res, next) => {
  console.log('req.user.id');
  const userId = req.user.id;

  const user = await User.findOne({ where: { id: userId } });
  username = user.Username;

  const allStudents = await Student.findAll({
    where: { Username: { [Sequelize.Op.ne]: username } },
  });

  res.status(200).send(allStudents);
});
const updateStudent = catchAsync(async (req, res, next) => {
  const id = req.user.id;
  const user = await User.findOne({ where: { id: id } });
  const username = user.Username;
  const student = await Student.update(req.body, {
    where: { Username: username },
  });
  res.status(200).send(student);
});
const getNotPartneredStudents = catchAsync(async (req, res, next) => {
  const username = req.params.username;
  console.log(username);
  const student = await Student.findAll({
    where: { Username: { [Sequelize.Op.ne]: username }, Status: 'start' },
  });

  res.status(200).send(student);
});
module.exports = {
  CurrentStudent,
  getAllStudents,
  getStudent,
  getAll,
  updateStudent,
  getNotPartneredStudents,
};
