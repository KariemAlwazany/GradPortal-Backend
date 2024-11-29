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

module.exports = {
  CurrentStudent,
  getAllStudents,
  getStudent,
  getAll,
};
