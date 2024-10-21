const db = require('./../models/favProjectsModel');
const db1 = require('./../models/projectsModel');
const catchAsync = require('./../utils/catchAsync');
const FavProjects = db.FavProjects;
const Projects = db1.Projects;

const getMyFavProjects = catchAsync(async (req, res, next) => {
  const favProjects = await FavProjects.findAll({
    where: { User_ID: req.user.id },
    include: [
      {
        model: Projects,
        as: 'graduationProject',
      },
    ],
  });

  res.status(200).json({
    status: 'success',
    data: {
      favProjects,
    },
  });
});

const addFav = catchAsync(async (req, res, next) => {
  const GPid = req.body.projectId;
  const favProjects = await FavProjects.create({
    GP_ID: GPid,
    User_ID: req.user.id,
  });

  res.status(200).json({
    status: 'success',
    data: {
      favProjects,
    },
  });
});

const deleteFav = catchAsync(async (req, res, next) => {
  const GPid = req.params.projectId;
  const favProjects = await FavProjects.destroy({
    where: { GP_ID: GPid, User_ID: req.user.id },
  });

  res.status(204).json({
    status: 'success',
    data: {
      favProjects,
    },
  });
});

module.exports = {
  getMyFavProjects,
  addFav,
  deleteFav,
};
