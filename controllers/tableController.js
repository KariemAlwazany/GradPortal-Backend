const db = require('./../models/tableModel');
const db1 = require('./../models/postStatusModel');
const db2 = require('./../models/testTableModel');
const db3 = require('./../models/roomModel');
const db4 = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const { sequelize } = require('./../models');

const Table = db.Table;
const Room = db3.Room;
const Projects = db2.Projects;
const Status = db1.Status;
const User = db4.User;
const { Sequelize } = require('sequelize');
const createTable = catchAsync(async (req, res, next) => {
  const destroyStatus = await Status.destroy({ where: {} });
  const { StartDate, EndDate } = req.body;

  // Clear existing table
  await Table.destroy({ where: {} });

  const projects = await Projects.findAll(); // Fetch all projects
  const rooms = await Room.findAll(); // Fetch all rooms
  const allSupervisors = [
    ...new Set(projects.map((project) => project.Supervisor_1)),
  ]; // Unique list of supervisors

  const startDateTime = new Date(StartDate);
  const endDateTime = new Date(EndDate);

  const startTime = new Date(
    startDateTime.setHours(startDateTime.getHours() + 2),
  );
  const endTime = new Date(endDateTime.setHours(endDateTime.getHours() + 2));

  // Calculate the number of days
  const days = Math.ceil((endDateTime - startDateTime) / (1000 * 60 * 60 * 24));

  const dailyStartTime = new Date(
    startDateTime.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0),
  );
  const dailyEndTime = new Date(
    endDateTime.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0),
  );

  const totalProjects = projects.length;
  const projectsPerDay = Math.ceil(totalProjects / days);
  const sessionDuration = 25; // 20 minutes discussion + 5 minutes break
  const discussionsPerSession = 4; // 4 discussions at the same time
  const breakInterval = 70; // 1 hour and 10 minutes
  const breakDuration = 20; // 20 minutes break

  let unscheduledProjects = [...projects];
  let scheduledProjects = [];
  let currentDayStart = new Date(dailyStartTime);

  for (let day = 0; day < days; day++) {
    let currentDayEnd = new Date(currentDayStart);
    currentDayEnd.setHours(dailyEndTime.getHours());
    currentDayEnd.setMinutes(dailyEndTime.getMinutes());

    let currentTime = new Date(currentDayStart);
    let elapsedMinutes = 0;

    const dayProjects = unscheduledProjects.splice(0, projectsPerDay);

    while (dayProjects.length > 0 && currentTime <= currentDayEnd) {
      const sessionProjects = dayProjects.splice(0, discussionsPerSession);
      const usedSupervisors = new Set();
      const usedRooms = new Set();
      let discussions = [];

      for (const project of sessionProjects) {
        if (usedSupervisors.has(project.Supervisor_1)) {
          dayProjects.push(project);
          continue;
        }

        const availableSupervisors = allSupervisors.filter(
          (sup) => sup !== project.Supervisor_1 && !usedSupervisors.has(sup),
        );

        if (availableSupervisors.length >= 2) {
          const [examiner1, examiner2] = availableSupervisors;

          // Find an available room
          const room = rooms.find((r) => !usedRooms.has(r.Room));
          if (!room) {
            dayProjects.push(project);
            continue;
          }

          // Schedule discussion
          discussions.push({
            Supervisor_1: project.Supervisor_1,
            Supervisor_2: project.Supervisor_2,
            Examiner_1: examiner1,
            Examiner_2: examiner2,
            Student_1: project.Student_1,
            Student_2: project.Student_2,
            GP_Type: project.GP_Type,
            GP_Title: project.GP_Title,
            Time: new Date(currentTime),
            Room: room.Room,
          });

          // Mark supervisors, examiners, and room as used
          usedSupervisors.add(project.Supervisor_1);
          usedSupervisors.add(examiner1);
          usedSupervisors.add(examiner2);
          usedRooms.add(room.Room);
        } else {
          dayProjects.push(project);
        }
      }

      // Save scheduled discussions to the database
      for (const discussion of discussions) {
        await Table.create(discussion);
        scheduledProjects.push(discussion);
      }

      // Increment time for the next session only once per session group
      if (discussions.length > 0) {
        currentTime.setMinutes(currentTime.getMinutes() + sessionDuration);
        elapsedMinutes += sessionDuration;
      }

      // Handle break
      if (elapsedMinutes >= breakInterval) {
        currentTime.setMinutes(currentTime.getMinutes() + breakDuration);
        elapsedMinutes = 0; // Reset elapsed minutes after a break
      }
    }

    // Move to the next day
    currentDayStart.setDate(currentDayStart.getDate() + 1);
    currentDayStart.setHours(dailyStartTime.getHours());
    currentDayStart.setMinutes(dailyStartTime.getMinutes());
  }

  if (scheduledProjects.length < totalProjects) {
    return res.status(200).json({
      status: 'partial',
      message: 'Some projects could not be scheduled due to conflicts.',
      scheduledCount: scheduledProjects.length,
      totalProjects: totalProjects,
    });
  }

  res.status(201).json({
    status: 'success',
    message: 'Discussion table created successfully!',
    scheduledCount: scheduledProjects.length,
    totalProjects: totalProjects,
    data: scheduledProjects,
  });
});

const getTable = catchAsync(async (req, res, next) => {
  const table = await Table.findAll();
  const checkCurrentUser = await User.findOne({ where: { id: req.user.id } });
  if (checkCurrentUser.Role == 'Doctor') {
    const checkStatus = await Status.findOne({ where: { status: 'Doctor' } });
    if (checkStatus) {
      res.status(200).json({
        status: 'success',
        data: {
          table,
        },
      });
    } else {
      res.status(404).json({
        status: 'fail',
        message: 'No data',
      });
    }
  } else if (checkCurrentUser.Role == 'Student') {
    const checkStatus = await Status.findOne({ where: { status: 'Student' } });
    if (checkStatus) {
      res.status(200).json({
        status: 'success',
        data: {
          table,
        },
      });
    } else {
      res.status(404).json({
        status: 'fail',
        message: 'No data',
      });
    }
  } else {
    res.status(200).json({
      status: 'success',
      data: {
        table,
      },
    });
  }
});
const updateTable = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const id = req.params.id;
  const updatedTable = await Table.update(req.body, { where: { id: id } });
  res.status(200).json({
    status: 'success',
    data: {
      updatedTable,
    },
  });
});
const postForDoctors = catchAsync(async (req, res, next) => {
  const createStatus = await Status.create({ status: 'Doctor' });
  res.status(200).json({
    status: 'success',
    data: {
      createStatus,
    },
  });
});
const postForStudent = catchAsync(async (req, res, next) => {
  const createStatus = await Status.create({ status: 'Student' });
  res.status(200).json({
    status: 'success',
    data: {
      createStatus,
    },
  });
});
const getTableForStudent = catchAsync(async (req, res, next) => {
  const userid = req.user.id;
  const student = await User.findOne({ where: { id: userid } });
  const username = student.Username;

  const table = await Table.findOne({
    where: {
      [Sequelize.Op.or]: [{ Student_1: username }, { Student_2: username }],
    },
  });
  const checkStatus = await Status.findOne({ where: { status: 'Student' } });
  if (checkStatus) {
    res.status(200).json({
      status: 'success',
      data: {
        table,
      },
    });
  } else {
    res.status(404).json({
      status: 'fail',
      message: 'No data',
    });
  }
});
const getTableForDoctor = catchAsync(async (req, res, next) => {
  const userid = req.user.id;
  const doctor = await User.findOne({ where: { id: userid } });
  const username = doctor.Username;
  const table = await Table.findAll({
    where: {
      [Sequelize.Op.or]: [
        { Supervisor_1: username },
        { Supervisor_2: username },
        { Examiner_1: username },
        { Examiner_2: username },
      ],
    },
  });
  const checkStatus = await Status.findOne({ where: { status: 'Doctor' } });
  if (checkStatus) {
    res.status(200).json({
      status: 'success',
      data: {
        table,
      },
    });
  } else {
    res.status(404).json({
      status: 'fail',
      message: 'No data',
    });
  }
});
module.exports = {
  createTable,
  getTable,
  updateTable,
  postForDoctors,
  postForStudent,
  getTableForStudent,
  getTableForDoctor,
};
