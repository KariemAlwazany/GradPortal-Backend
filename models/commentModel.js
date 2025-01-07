const { DataTypes } = require('sequelize');
const { sequelize } = require('.');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Posts',
      key: 'id',
    },
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true, // Comments can be text-only
  },
  image: {
    type: DataTypes.BLOB('long'), // Storing image as BLOB
    allowNull: true, // Optional field for an image
  },
  createdBy: {
    type: DataTypes.STRING,
    allowNull: false, // Refers to the Username of the user who created the comment
  },
}, {
  tableName: 'Comments',
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

module.exports = Comment;
