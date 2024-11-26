const db = require('./../models/doctorModel');
const db1 = require('./../models/projectsModel');
const db2 = require('./../models/userModel');
const db3 = require('./../models/studentModel');
const db4 = require('./../models/messagesModel');
const { Sequelize } = require('sequelize');
const catchAsync = require('./../utils/catchAsync');
const Projects = db1.Projects;
const User = db2.User;
const Messages = db4.Messages;
const sendMessage = catchAsync(async (req, res, next) => {
  const userID = req.user.id;
  console.log(req.body);
  const user = await User.findOne({ where: { id: userID } });
  const { Message, Receiver } = req.body;

  const createMessage = await Messages.create({
    Sender: user.Username,
    Receiver: Receiver,
    Message: Message,
  });
  res.status(200).json({
    status: 'success',
    data: {
      createMessage,
    },
  });
});

const getStudentMessage = catchAsync(async (req, res, next) => {
  const userID = req.user.id;
  const user = await User.findOne({ where: { id: userID } });
  const username = user.Username;

  const findProject = await Projects.findOne({
    where: {
      [Sequelize.Op.or]: [{ Student_1: username }, { Student_2: username }],
      done: 'no',
    },
  });
  if (findProject.GP_Type == 'Software') {
    const findMessage = await Messages.findAll({
      where: {
        [Sequelize.Op.or]: [
          { Receiver: findProject.GP_Title },
          { Receiver: 'All Students' },
          { Receiver: 'Software Projects' },
        ],
      },
    });
    res.status(200).json({
      status: 'success',
      data: {
        findMessage,
      },
    });
  } else if (findProject.GP_Type == 'Hardware') {
    const findMessage = await Messages.findAll({
      where: {
        [Sequelize.Op.or]: [
          { Receiver: findProject.GP_Title },
          { Receiver: 'All Students' },
          { Receiver: 'Hardware Projects' },
        ],
      },
    });
    res.status(200).json({
      status: 'success',
      data: {
        findMessage,
      },
    });
  } else {
    const data = 'no data';
    res.status(200).json({
      status: 'success',
      data: {
        data,
      },
    });
  }
});

const getDoctorMessage = catchAsync(async (req, res, next) => {
  const userID = req.user.id;
  const user = await User.findOne({ where: { id: userID } });
  const username = user.Username;
  const findMessage = await Messages.findAll({ where: { Receiver: username } });

  res.status(200).json({
    status: 'success',
    data: {
      findMessage,
    },
  });
});

const getMessagesSentByMe = catchAsync(async (req, res, next) => {
  const userID = req.user.id;
  const user = await User.findOne({ where: { id: userID } });
  const username = user.Username;
  const findMessage = await Messages.findAll({ where: { Sender: username } });

  res.status(200).json({
    status: 'success',
    data: {
      findMessage,
    },
  });
});

const deleteMessage = catchAsync(async (req, res, next) => {
  const messageId = req.body.id;
  const message = await Messages.destroy({ where: { id: messageId } });
  res.status(204).json({
    status: 'success',
    data: {
      message,
    },
  });
});
const updateMessage = catchAsync(async (req, res, next) => {
  const messageId = req.body.id;
  const message = await Messages.update(req.body, { where: { id: messageId } });
  res.status(200).json({
    status: 'success',
    data: {
      message,
    },
  });
});
module.exports = {
  getDoctorMessage,
  getStudentMessage,
  sendMessage,
  getMessagesSentByMe,
  updateMessage,
  deleteMessage,
};
