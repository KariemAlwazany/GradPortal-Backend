const db = require('./../models/deadlinesModel');
const db1 = require('./../models/userModel');
const db2 = require('./../models/reservationModel');
const catchAsync = require('./../utils/catchAsync');
const Deadline = db.Deadline;
const User = db1.User;
const Reservation = db2.Reservation;
getDoctorDeadlines = catchAsync(async (req, res, next) => {
  const userID = req.user.id;
  const user = await User.findOne({ where: { id: userID } });
  const username = user.Username;

  const deadLines = await Deadline.findAll({
    where: {
      Doctor: username,
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      deadLines,
    },
  });
});
getStudentDeadlines = catchAsync(async (req, res, next) => {
  const userID = req.user.id;
  const user = await User.findOne({ where: { id: userID } });
  console.log(user.Username);
  const username = user.Username;

  const doctor = await Reservation.findOne({ where: { Student: username } });

  const deadLines = await Deadline.findAll({
    where: {
      Doctor: doctor.Doctor,
    },
  });
  res.status(200).json({
    status: 'success',
    data: {
      deadLines,
    },
  });
});
postDoctorDeadlines = catchAsync(async (req, res, next) => {
  console.log('test:' + req.user.id);
  const userID = req.user.id;
  console.log(userID);
  console.log(req.body);
  const user = await User.findOne({ where: { id: userID } });
  const username = user.Username;
  const { Date, File, Description, Title } = req.body;

  const deadLines = await Deadline.create({
    Doctor: username,
    Date,
    File,
    Description,
    Title,
  });

  res.status(200).json({
    status: 'success',
    data: {
      deadLines,
    },
  });
});
updateDeadline = catchAsync(async (req, res, next) => {
  //   console.log(req.body.id);
  console.log(req.body);
  const deadlineID = req.body.id;

  const deadLines = await Deadline.update(req.body, {
    where: {
      id: deadlineID,
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      deadLines,
    },
  });
});
deleteDeadline = catchAsync(async (req, res, next) => {
  const deadlineID = req.body.id;

  const deadLines = await Deadline.destroy({
    where: {
      id: deadlineID,
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      deadLines,
    },
  });
});

module.exports = {
  getDoctorDeadlines,
  getStudentDeadlines,
  postDoctorDeadlines,
  updateDeadline,
  deleteDeadline,
};
