const db = require('./../models/doctorModel');

const catchAsync = require('./../utils/catchAsync');
const Doctor = db.Doctor;
getAllDoctors = catchAsync(async (req, res, next) => {
  const allDoctors = await Doctor.findAll();

  res.status(200).send(allDoctors);
});
module.exports = {
  getAllDoctors,
};
