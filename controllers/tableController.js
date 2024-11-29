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
  const startTime = new Date(StartDate);
  const endTime = new Date(EndDate);

  let currentTime = new Date(startTime);
  const sessionDuration = 25; // 20 minutes discussion + 5 minutes break
  const discussionsPerSession = 4; // 4 discussions at the same time

  let unscheduledProjects = [...projects];
  let scheduledProjects = [];

  while (unscheduledProjects.length > 0 && currentTime <= endTime) {
    let sessionProjects = unscheduledProjects.slice(0, discussionsPerSession); // Take up to 4 projects
    unscheduledProjects = unscheduledProjects.slice(discussionsPerSession); // Remove selected projects

    const usedSupervisors = new Set();
    const usedRooms = new Set();
    let discussions = [];

    for (const project of sessionProjects) {
      const availableSupervisors = allSupervisors.filter(
        (sup) => sup !== project.Supervisor_1 && !usedSupervisors.has(sup),
      );

      if (availableSupervisors.length >= 2) {
        const [examiner1, examiner2] = availableSupervisors;

        // Find an available room
        const room = rooms.find((r) => !usedRooms.has(r.Room));
        if (!room) {
          // If no room is available, skip this project
          unscheduledProjects.push(project);
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
        // Re-add the project to the unscheduled list for later sessions
        unscheduledProjects.push(project);
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

  if (scheduledProjects.length < projects.length) {
    return res.status(200).json({
      status: 'partial',
      message: 'Some projects could not be scheduled due to conflicts.',
      scheduledCount: scheduledProjects.length,
      totalProjects: projects.length,
    });
  }

  res.status(201).json({
    status: 'success',
    message: 'Discussion table created successfully!',
    scheduledCount: scheduledProjects.length,
    totalProjects: projects.length,
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
