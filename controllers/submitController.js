const db = require('./../models/submitModel');
const db1 = require('./../models/userModel');
const db3 = require('./../models/doctorModel');

const db4 = require('./../models/projectsModel');
const db2 = require('./../models/deadlinesModel');
const catchAsync = require('./../utils/catchAsync');
const { sequelize } = require('./../models'); // Import sequelize correctly from your models/index.js
const { Sequelize } = require('sequelize'); // Ensure Sequelize is imported

const Submit = db.Submit;
const User = db1.User;
const Doctor = db3.Doctor;
const Deadline = db2.Deadline;
const Projects = db4.Projects;

const studentSubmit = catchAsync(async (req, res, next) => {
  const userID = req.user.id;
  console.log(req.body);
  const user = await User.findOne({ where: { id: userID } });
  const username = user.Username;
  const { Date, FileSubmitted, Title, TaskID, Doctor } = req.body;

  const findSubmit = await Submit.findOne({
    where: { Student: username, TaskID: TaskID },
  });

  if (findSubmit) {
    const updateSubmit = await Submit.update(req.body, {
      where: { Student: username, TaskID: TaskID },
    });
    res.status(200).json({
      status: 'success',
      data: {
        updateSubmit,
      },
    });
  } else {
    const submit = await Submit.create({
      Student: username,
      Date,
      FileSubmitted,
      TaskID,
      Title,
      Doctor,
    });
    res.status(200).json({
      status: 'success',
      data: {
        submit,
      },
    });
  }
});

const getSubmission = catchAsync(async (req, res, next) => {
  const userID = req.user.id;

  const user = await User.findOne({ where: { id: userID } });
  const username = user.Username;
  const { TaskID } = req.body;

  const findSubmit = await Submit.findOne({
    where: { Student: username, TaskID: TaskID },
  });

  res.status(200).json({
    status: 'success',
    data: {
      findSubmit,
    },
  });
});

const getSubmissionsForDoctor = catchAsync(async (req, res, next) => {
  const userID = req.user.id;

  const user = await User.findOne({ where: { id: userID } });
  const username = user.Username;
  const doctor = await Doctor.findOne({ where: { Username: username } });

  if (!doctor) {
    return res.status(404).json({
      status: 'fail',
      message: 'Doctor not found.',
    });
  }

  const query = `
    SELECT 
      s.id AS SubmissionID,
      s.Title AS SubmissionTitle,
      s.FileSubmitted,
      s.Student AS StudentUsername,
      s.Date AS SubmissionDate,
      p.GP_ID AS ProjectID,
      p.GP_Title AS ProjectTitle,
      p.Student_1 AS Student1,
      p.Student_2 AS Student2,
      p.GP_Description AS ProjectDescription,
      p.GP_Type AS ProjectType  -- Add project type to query
    FROM 
      Submits s
    JOIN 
      Graduation_Projects p 
    ON 
      (s.Student = p.Student_1 OR s.Student = p.Student_2)
    WHERE 
      s.Doctor = :doctorUsername
  `;

  const replacements = { doctorUsername: doctor.Username };

  const submissions = await sequelize.query(query, {
    replacements,
    type: sequelize.QueryTypes.SELECT,
  });

  // Respond with all submissions as an array
  res.status(200).json({
    status: 'success',
    data: {
      submissions,
    },
  });
});

const getFinalSubmission = catchAsync(async (req, res, next) => {
  const student = req.params.student;
  const task = await Deadline.findOne({ where: { Title: 'Final Submission' } });
  if (!task) {
    return res.status(404).json({
      status: 'fail',
      message: 'Final Submission deadline not found.',
    });
  }
  const findSubmit = await Submit.findOne({
    where: { Student: student, TaskID: task.id },
  });
  res.status(200).json({
    status: 'success',
    data: {
      findSubmit,
    },
  });
});
const getAbstractSubmission = catchAsync(async (req, res, next) => {
  const student = req.params.student;
  const task = await Deadline.findOne({
    where: { Title: 'Abstract Submission' },
  });
  const findSubmit = await Submit.findOne({
    where: { Student: student, TaskID: task.id },
  });
  res.status(200).json({
    status: 'success',
    data: {
      findSubmit,
    },
  });
});
const getProjects = catchAsync(async (req, res, next) => {
  const GP_ID = req.params.id;
  const project = await Projects.findOne({
    where: { GP_ID: GP_ID, done: 'yes' },
  });

  const submission = await Submit.findAll({
    where: {
      [Sequelize.Op.or]: [
        { Student: project.Student_1 },
        { Student: project.Student_2 },
      ],
      [Sequelize.Op.or]: [
        { Title: 'Abstract Submission' },
        { Title: 'Final Submission' },
      ],
    },
  });
  res.status(200).json({
    status: 'success',
    data: submission,
  });
});

module.exports = {
  studentSubmit,
  getSubmission,
  getSubmissionsForDoctor,
  getFinalSubmission,
  getAbstractSubmission,
  getProjects,
};
