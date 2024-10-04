const { User } = require('../models/userModel');

User.hasMany(Garden, { foreignKey: 'owner_id' });

User.hasMany(Article, { foreignKey: 'Publisher_ID' });
// Article.belongsTo(User, { foreignKey: 'Publisher_ID' });

User.hasMany(Resource, { foreignKey: 'OwnerID' });
// Resource.belongsTo(User, { foreignKey: 'OwnerID' });
