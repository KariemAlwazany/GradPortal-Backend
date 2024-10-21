const db = require('./../models/studentModel');
const db1 = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

const Student = db.Student;
const User = db1.User;
getCurrentStudent = catchAsync(async (req, res, next) => {
  const userID = req.user.id;

  const user = await User.findOne({ where: { id: userID } });
  username = user.Username;
  const student = await Student.findOne({ where: { Username: username } });
  res.status(200).send(student);
});
module.exports = {
  getCurrentStudent,
};
