const { DataTypes } = require('sequelize');
const { sequelize } = require('.');

const Manage = sequelize.define('Manage', {
  JoinApplication: {
    type: DataTypes.STRING,
  },
  FindPartners: {
    type: DataTypes.STRING,
  },
  FindDoctor: {
    type: DataTypes.STRING,
  },
  SubmitAbstract: {
    type: DataTypes.STRING,
  },
  FinalSubmission: {
    type: DataTypes.STRING,
  },
  StudentNumber: {
    type: DataTypes.INTEGER,
  },
  JoinApplicationStatus: {
    type: DataTypes.STRING,
  },
  FindPartnersStatus: {
    type: DataTypes.STRING,
  },
  FindDoctorStatus: {
    type: DataTypes.STRING,
  },
  SubmitAbstractStatus: {
    type: DataTypes.STRING,
  },
  FinalSubmissionStatus: {
    type: DataTypes.STRING,
  },
});
module.exports = { Manage };
