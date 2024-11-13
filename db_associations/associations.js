const { User } = require('../models/userModel');
const { Seller } = require('../models/sellerModel');
const { FavProjects } = require('../models/favProjectsModel');
const { Projects } = require('../models/projectsModel');
const { WaitingList } = require('../models/waitingModel');
const { Student } = require('../models/studentModel');
const { Submit } = require('../models/submitModel');
const { Doctor } = require('../models/doctorModel');

// Define associations
FavProjects.belongsTo(Projects, {
  foreignKey: 'GP_ID',
  as: 'graduationProject',
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

// Define a loose association between Submit and Projects without enforcing a foreign key constraint
Submit.belongsTo(Projects, {
  as: 'Project', // Alias to reference Projects in joins
});

Projects.hasMany(Submit, {
  as: 'Submissions',
});

// Export the models with associations
module.exports = {
  FavProjects,
  Projects,
  WaitingList,
  Student,
  Submit,
  Doctor,
  Seller,
};
