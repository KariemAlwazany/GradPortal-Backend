const { User } = require('../models/userModel');
const { Seller } = require('../models/sellerModel');
const { FavProjects } = require('../models/favProjectsModel');
const { Projects } = require('../models/projectsModel');

// Resource.belongsTo(User, { foreignKey: 'OwnerID' });
// User.hasMany(Seller, { foreignKey: 'Username' });

// Define associations here
FavProjects.belongsTo(Projects, {
  foreignKey: 'GP_ID',
  as: 'graduationProject', // Use alias to reference Projects in the join
});

Projects.hasMany(FavProjects, {
  foreignKey: 'GP_ID',
  as: 'favProjects',
});

module.exports = {
  FavProjects,
  Projects,
};
