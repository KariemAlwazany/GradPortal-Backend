const db = require('./../models/userModel');

const db1 = require('./../models/studentModel');
const db2 = require('./../models/doctorModel');
const db3 = require('./../models/sellerModel');

const catchAsync = require('./../utils/catchAsync');

const User = db.User;
const Student = db1.Student;
const Doctor = db2.Doctor;
const Seller = db3.Seller;
const getDoctors = catchAsync(async (req, res, next) => {
  const doctors = await Doctor.findAll({
    include: [
      {
        model: User,
        where: { approval: 'false' },
        attributes: ['Username', 'FullName', 'Email'],
      },
    ],
  });

  res.status(200).json({
    status: 'success',
    data: {
      doctors,
    },
  });
});

const getStudents = catchAsync(async (req, res, next) => {
  const students = await Student.findAll({
    include: [
      {
        model: User,
        where: { approval: 'false' }, // Join condition
        attributes: ['Username', 'FullName', 'Email'], // Select specific User attributes
      },
    ],
  });
  res.status(200).json({
    status: 'success',
    data: {
      students,
    },
  });
});
const getSellers = catchAsync(async (req, res, next) => {
  const sellers = await Seller.findAll({
    include: [
      {
        model: User,
        where: { approval: 'false' }, // Join condition
        attributes: ['Username', 'FullName', 'Email'], // Select specific User attributes
      },
    ],
  });
  res.status(200).json({
    status: 'success',
    data: {
      sellers,
    },
  });
});
const approve = catchAsync(async (req, res, next) => {
  username = req.body.Username;
  const approval = await User.update(
    { approval: 'true' },
    { where: { Username: username, approval: 'false' } },
  );
});
const decline = catchAsync(async (req, res, next) => {
  username = req.body.Username;
  const getRole = await User.findOne({ where: { Username: username } });

  if (getRole.Role == 'Doctor') {
    const getDoctor = await Doctor.findOne({ where: { Username: username } });
    await Doctor.destroy({ where: { Username: username } });
  } else if (getRole.Role == 'Student') {
    const getStudent = await Student.findOne({ where: { Username: username } });
    await Student.destroy({ where: { Username: username } });
  } else if (getRole.Role == 'Seller') {
    const getStudent = await Seller.findOne({ where: { Username: username } });
    await Seller.destroy({ where: { Username: username } });
  }
  const decline = await User.destroy({
    where: { Username: username, approval: 'false' },
  });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

getAllDoctors = module.exports = {
  getDoctors,
  getStudents,
  getSellers,
  approve,
  decline,
};
