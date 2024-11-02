const { User } = require('../models/userModel');
const { Seller } = require('../models/sellerModel');
const { FavProjects } = require('../models/favProjectsModel');
const { Projects } = require('../models/projectsModel');
const { WaitingList } = require('../models/waitingModel');
const { Student } = require('../models/studentModel');

const { Doctor } = require('../models/doctorModel');
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

WaitingList.belongsTo(Student, { foreignKey: 'Partner_1', as: 'StudentInfo' });
Student.hasMany(WaitingList, {
  foreignKey: 'Partner_1',
  as: 'WaitListEntries',
});
Student.belongsTo(User, { foreignKey: 'Username', targetKey: 'Username' });
User.hasOne(Student, { foreignKey: 'Username', sourceKey: 'Username' });

Doctor.belongsTo(User, { foreignKey: 'Username', targetKey: 'Username' });
User.hasOne(Doctor, { foreignKey: 'Username', sourceKey: 'Username' });
Seller.belongsTo(User, { foreignKey: 'Username', targetKey: 'Username' });
User.hasOne(Seller, { foreignKey: 'Username', sourceKey: 'Username' });

module.exports = {
  FavProjects,
  Projects,
  WaitingList,
  Student,
};
