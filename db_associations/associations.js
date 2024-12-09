const { User } = require('../models/userModel');
const Sellers = require('../models/sellerModel');
const { FavProjects } = require('../models/favProjectsModel');
const { Projects } = require('../models/projectsModel');
const { WaitingList } = require('../models/waitingModel');
const { Student } = require('../models/studentModel');
const { Submit } = require('../models/submitModel');
const { Doctor } = require('../models/doctorModel');
const Items = require('../models/itemsModel'); 
const Shop = require('../models/shopModel'); 
const Receipt = require('../models/receiptModel');
const Offers = require('../models/offersModel');

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
Sellers.belongsTo(User, { foreignKey: 'Username', targetKey: 'Username' });
User.hasOne(Sellers, { foreignKey: 'Username', sourceKey: 'Username' });

// Add the associations for Items
Items.belongsTo(Sellers, { foreignKey: 'Shop_name', as: 'shop' });
Sellers.hasMany(Items, { foreignKey: 'Shop_name', as: 'items' });

Shop.belongsTo(Sellers, { foreignKey: 'Seller_Username', as: 'seller' });

Receipt.belongsTo(Sellers, { foreignKey: 'shop_name', as: 'shop' });
Receipt.belongsTo(Sellers, { foreignKey: 'Seller_Username', as: 'seller' });
Receipt.belongsTo(User, { foreignKey: 'buyer_Username', as: 'buyer',});


Items.hasMany(Offers, {
  foreignKey: 'Item_ID',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Offers.belongsTo(Items, {
  foreignKey: 'Item_ID',
  onDelete: 'CASCADE', 
  onUpdate: 'CASCADE', 
});

// Define a loose association between Submit and Projects without enforcing a foreign key constraint
Submit.belongsTo(Projects, {
  as: 'Project', // Alias to reference Projects in joins
});

Projects.hasMany(Submit, {
  as: 'Submissions',
});

// In the Projects model file, add these associations
Projects.belongsTo(Student, {
  as: 'Student1',
  foreignKey: 'Student_1',
  targetKey: 'Username',
});
Projects.belongsTo(Student, {
  as: 'Student2',
  foreignKey: 'Student_2',
  targetKey: 'Username',
});

// Export the models with associations
module.exports = {
  FavProjects,
  Projects,
  WaitingList,
  Student,
  Submit,
  Doctor,
  Sellers,
  Items,  // Export Items model
  Receipt,
};
