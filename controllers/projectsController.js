const db = require('./../models/projectsModel');
const factory = require('./factoryController');
const catchAsync = require('./../utils/catchAsync');
const Projects = db.Projects;

getAllProjects = catchAsync(async (req, res, next) => {
  const Graduation_Projects = await Projects.findAll();
  res.status(200).send(Graduation_Projects);
});
module.exports = {
  getAllProjects,
};
