const db = require('./../models/roomModel');
const db1 = require('./../models/userModel');
const db2 = require('./../models/projectsModel');
const db3 = require('./../models/doctorModel');

const catchAsync = require('./../utils/catchAsync');
const { sequelize } = require('./../models'); // Import sequelize correctly from your models/index.js

const Room = db.Room;

const createRoom = catchAsync(async (req, res, next) => {
  const newRoom = await Room.create({
    Room: req.body.Room,
  });
  res.status(201).json({
    status: 'success',
    data: newRoom,
  });
});
const getRooms = catchAsync(async (req, res, next) => {
  const rooms = await Room.findAll();
  console.log(rooms);
  res.status(200).json({
    status: 'success',
    data: rooms,
  });
});
const updateRoom = catchAsync(async (req, res, next) => {
  const roomUpdated = await Room.update(req.body, {
    where: { id: req.params.id },
  });
  res.status(200).json({
    status: 'success',
    data: roomUpdated,
  });
});
const deleteRoom = catchAsync(async (req, res, next) => {
  const roomDeleted = await Room.destroy({
    where: { id: req.params.id },
  });
  res.status(204).json({
    status: 'success',
    data: roomDeleted,
  });
});
module.exports = { createRoom, getRooms, updateRoom, deleteRoom };
