const db = require('./../models/projectsModel');

const db1 = require('./../models/studentModel');
const db2 = require('./../models/userModel');
const factory = require('./factoryController');
const catchAsync = require('./../utils/catchAsync');
const Projects = db.Projects;
const Student = db1.Student;
const User = db2.User;
const { Sequelize } = require('sequelize');

getAllProjects = catchAsync(async (req, res, next) => {
  const Graduation_Projects = await Projects.findAll();
  res.status(200).send(Graduation_Projects);
});
getCurrentProjects = catchAsync(async (req, res, next) => {
  const currentProjects = await Projects.findAll({ where: { done: 'no' } });
  res.status(200).send(currentProjects);
});
getProjectsCount = catchAsync(async (req, res, next) => {
  const projectsCount = await Projects.count();
  res.status(200).json({
    status: 'success',
    data: {
      projectsCount,
    },
  });
});
getSoftwareCount = catchAsync(async (req, res, next) => {
  const softwareCount = await Projects.count({
    where: { GP_Type: 'Software' },
  });
  res.status(200).json({
    status: 'success',
    data: {
      softwareCount,
    },
  });
});
getHardwareCount = catchAsync(async (req, res, next) => {
  const hardwareCount = await Projects.count({
    where: { GP_Type: 'Hardware' },
  });
  res.status(200).json({
    status: 'success',
    data: {
      hardwareCount,
    },
  });
});
getProjectDetails = catchAsync(async (req, res, next) => {
  const GP_ID = req.params.id;
  const projectDetails = await Projects.findOne({ where: { GP_ID: GP_ID } });
  res.status(200).send(projectDetails);
});
getStudentProject = catchAsync(async (req, res, next) => {
  const userID = req.user.id;

  const user = await User.findOne({ where: { id: userID } });
  username = user.Username;
  const student = await Student.findOne({ where: { Username: username } });
  const projectDetails = await Projects.findOne({
    where: {
      [Sequelize.Op.or]: [
        { Student_1: student.Username },
        { Student_2: student.Username },
      ],
    },
  });
  res.status(200).send(projectDetails);
});
module.exports = {
  getAllProjects,
  getCurrentProjects,
  getProjectsCount,
  getSoftwareCount,
  getHardwareCount,
  getProjectDetails,
  getStudentProject,
};
