const db = require('./../models/projectsModel');
const factory = require('./factoryController');
const catchAsync = require('./../utils/catchAsync');
const Projects = db.Projects;

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
module.exports = {
  getAllProjects,
  getCurrentProjects,
  getProjectsCount,
  getSoftwareCount,
  getHardwareCount,
};
