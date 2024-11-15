const db = require('./../models/meetingModel');

const db1 = require('./../models/projectsModel');
const db2 = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const { Sequelize } = require('sequelize'); // Ensure Sequelize is imported

const Meeting = db.Meeting;
const Projects = db1.Projects;
const User = db2.User;
const getWaitingListMeeting = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findOne({ where: { id: userId } });
  const username = user.Username;
  const meetings = await Meeting.findAll({
    where: { Doctor: username, Status: 'Pending' },
  });
  res.status(200).json({
    status: 'success',
    data: {
      meetings,
    },
  });
});
const studentCreateMeeting = catchAsync(async (req, res, next) => {
  console.log(req.body.Date);
  const { Date } = req.body;
  const userId = req.user.id;
  const user = await User.findOne({ where: { id: userId } });
  const username = user.Username;
  const info = await Projects.findOne({
    where: {
      [Sequelize.Op.or]: [{ Student_1: username }, { Student_2: username }],
    },
    done: 'no',
  });

  const meeting = await Meeting.create({
    Student_1: info.Student_1,
    Student_2: info.Student_2,
    Doctor: info.Supervisor_1,
    GP_Type: info.GP_Type,
    GP_Title: info.GP_Title,
    Status: 'Pending',
    Date: Date,
  });
  res.status(200).json({
    status: 'success',
    data: {
      meeting,
    },
  });
});
const approve = catchAsync(async (req, res, next) => {
  const meetingId = req.body.id;
  const meeting = await Meeting.update(
    { Status: 'Approved' },
    { where: { id: meetingId } },
  );
  res.status(200).json({
    status: 'success',
    data: {
      meeting,
    },
  });
});
const decline = catchAsync(async (req, res, next) => {
  const meetingId = req.body.id;
  const meeting = await Meeting.destroy({ where: { id: meetingId } });
  res.status(204).json({
    status: 'success',
    data: {
      meeting,
    },
  });
});
const getMyMeetings = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findOne({ where: { id: userId } });
  const username = user.Username;
  const meetings = await Meeting.findAll({
    where: { Doctor: username, Status: 'Approved', RoomStatus: null },
  });
  res.status(200).json({
    status: 'success',
    data: {
      meetings,
    },
  });
});
const addMeetingID = catchAsync(async (req, res, next) => {
  const id = req.body.id;
  const meetingID = req.body.MeetingID;
  console.log(req.body); //RoomStatus
  const meetings = await Meeting.update(
    { MeetingID: meetingID, RoomStatus: 'Live' },
    {
      where: { id: id },
    },
  );
  res.status(200).json({
    status: 'success',
    data: {
      meetings,
    },
  });
});

const getStudentMeetings = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findOne({ where: { id: userId } });
  const username = user.Username;

  const meetings = await Meeting.findAll({
    where: {
      [Sequelize.Op.and]: [
        {
          [Sequelize.Op.or]: [{ Student_1: username }, { Student_2: username }],
        },

        ,
        { Status: 'Approved' },
        { RoomStatus: 'Live' },
      ],
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      meetings,
    },
  });
});
const endMeeting = catchAsync(async (req, res, next) => {
  const id = req.body.id;
  console.log(req.body);
  const meetings = await Meeting.update(
    { RoomStatus: 'End' },
    {
      where: { id: id },
    },
  );
  res.status(200).json({
    status: 'success',
    data: {
      meetings,
    },
  });
});

module.exports = {
  getWaitingListMeeting,
  getMyMeetings,
  studentCreateMeeting,
  approve,
  decline,
  addMeetingID,
  getStudentMeetings,
  endMeeting,
};
