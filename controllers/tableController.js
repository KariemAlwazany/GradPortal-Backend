const db = require('./../models/tableModel');
const db1 = require('./../models/userModel');
const db2 = require('./../models/testTableModel');
const db3 = require('./../models/roomModel');
const catchAsync = require('./../utils/catchAsync');
const { sequelize } = require('./../models'); // Import sequelize correctly from your models/index.js

const Table = db.Table;
const User = db1.User;
const Room = db3.Room;
const Projects = db2.Projects;
const { Sequelize } = require('sequelize');
const createTable = catchAsync(async (req, res, next) => {
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

  let unscheduledProjects = [...projects];
  let scheduledProjects = [];
  let currentDayStart = new Date(dailyStartTime);

  for (let day = 0; day < days; day++) {
    let currentDayEnd = new Date(currentDayStart);
    currentDayEnd.setHours(dailyEndTime.getHours());
    currentDayEnd.setMinutes(dailyEndTime.getMinutes());

    let currentTime = new Date(currentDayStart);
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

      // Increment time for the next session
      currentTime.setMinutes(currentTime.getMinutes() + sessionDuration);
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

  res.status(200).json({
    status: 'success',
    data: {
      table,
    },
  });
});
module.exports = { createTable, getTable };
