const db = require('./../models/waitingModel');
const catchAsync = require('./../utils/catchAsync');
const studentController = require('./../controllers/studentController');
const db2 = require('./../models/studentModel');
const db3 = require('./../models/userModel');
const db4 = require('./../models/doctorModel');
const db5 = require('./../models/reservationModel');
const db6 = require('./../models/waitingPartnerModel');
const db7 = require('./../models/projectsModel');
const { Sequelize } = require('sequelize');
const Student = db2.Student;
const User = db3.User;
const WaitingList = db.WaitingList;
const Doctor = db4.Doctor;
const Reservation = db5.Reservation;
const WaitingPartner = db6.WaitingPartner;
const Projects = db7.Projects;
const addToWaiting = catchAsync(async (req, res, next) => {
  const userID = req.user.id;

  const user = await User.findOne({ where: { id: userID } });
  username = user.Username;
  const student = await Student.findOne({ where: { Username: username } });

  const updateStudent = await Student.update(
    { Status: 'waiting' },
    { where: { Username: username } },
  );

  const gettwo = await WaitingList.findOne({
    where: { PartnerStatus: 'approved', Partner_2: username },
  });
  const getone = await WaitingList.findOne({
    where: { PartnerStatus: 'approved', Partner_1: username },
  });
  if (getone) {
    Partner_1 = student.Username;

    const getPartner_2 = await WaitingPartner.findOne({
      where: { Partner_2: Partner_1, PartnerStatus: 'approved' },
    });
    Partner_2 = getPartner_2.Partner_1;
    console.log(
      '****************************************************************',
    );
    console.log(Partner_2);
    console.log(
      '****************************************************************',
    );
    console.log(req.body);
    checkWaitingList = await WaitingList.findOne({
      where: { Partner_1: student.Username },
    });
    console.log(checkWaitingList);
    if (checkWaitingList) {
      console.log('in check waiting list ');
      if (checkWaitingList.Doctor1 != null) {
        const updateDoctor = await WaitingList.update(
          { Doctor1: req.body.Doctor1 },
          { where: { Partner_1: student.Username } },
        );
        console.log(updateDoctor);

        checkWaitingList.DoctorStatus = 'waiting';
        checkWaitingList.ProjectStatus = 'waiting';
        checkWaitingList.save();
        res.status(200).json({
          status: 'success',
          data: {
            updateDoctor,
          },
        });
      }
    } else {
      const {
        ProjectType,
        ProjectStatus,
        PartnerStatus,
        Doctor1,
        Doctor2,
        Doctor3,
      } = req.body;
      const waitingList = await WaitingList.create({
        Partner_1: Partner_1,
        Partner_2: Partner_2,
        ProjectType: ProjectType,
        ProjectStatus: ProjectStatus,
        PartnerStatus: PartnerStatus,
        Doctor1: Doctor1,
        Doctor2: Doctor2,
        Doctor3: Doctor3,
        DoctorStatus: 'waitselect',
        ProjectStatus: 'waiting',
      });
      console.log(waitingList);
      res.status(200).json({
        status: 'success',
        data: {
          waitingList,
        },
      });
    }
  } else if (gettwo) {
    Partner_1 = student.Username;
    const getPartner_2 = await WaitingPartner.findOne({
      where: { Partner_1: Partner_1, PartnerStatus: 'approved' },
    });
    Partner_2 = getPartner_2.Partner_2;
    const {
      ProjectType,
      ProjectStatus,
      PartnerStatus,
      Doctor1,
      Doctor2,
      Doctor3,
    } = req.body;

    checkWaitingList = await WaitingList.findOne({
      where: { Partner_1: student.Username },
    });
    if (checkWaitingList) {
      if (checkWaitingList.Doctor1 != null) {
        const updateDoctor = await WaitingList.update(
          { Doctor1: Doctor1 },
          { where: { Partner_1: student.Username } },
        );
        checkWaitingList.DoctorStatus = 'waiting';
        checkWaitingList.ProjectStatus = 'waiting';
        checkWaitingList.save();
      }
    } else {
      const waitingList = await WaitingList.create({
        Partner_1: Partner_1,
        Partner_2: Partner_2,
        ProjectType: ProjectType,
        ProjectStatus: ProjectStatus,
        PartnerStatus: PartnerStatus,
        Doctor1: Doctor1,
        Doctor2: Doctor2,
        Doctor3: Doctor3,
        DoctorStatus: 'waitselect',
        ProjectStatus: 'waiting',
      });
      res.status(200).json({
        status: 'success',
        data: {
          waitingList,
        },
      });
    }
  } else {
    Partner_1 = username;

    const {
      ProjectType,
      ProjectStatus,
      PartnerStatus,
      Doctor1,
      Doctor2,
      Doctor3,
    } = req.body;

    checkWaitingList = await WaitingList.findOne({
      where: { Partner_1: Partner_1 },
    });
    if (checkWaitingList) {
      if (checkWaitingList.Doctor1 != null) {
        const updateDoctor = await WaitingList.update(
          { Doctor1: Doctor1 },
          { where: { Partner_1: student.Username } },
        );
        checkWaitingList.DoctorStatus = 'waiting';
        checkWaitingList.ProjectStatus = 'waiting';
        checkWaitingList.save();
      }
    } else {
      const waitingList = await WaitingList.create({
        Partner_1: Partner_1,
        Partner_2: 'no_partner',
        ProjectType: ProjectType,
        ProjectStatus: ProjectStatus,
        PartnerStatus: PartnerStatus,
        Doctor1: Doctor1,
        Doctor2: Doctor2,
        Doctor3: Doctor3,
        DoctorStatus: 'waitselect',
        ProjectStatus: 'waiting',
      });
      res.status(200).json({
        status: 'success',
        data: {
          waitingList,
        },
      });
    }
  }
});
updateWaiting = catchAsync(async (req, res, next) => {
  const userID = req.user.id;
  console.log(req.body);

  const user = await User.findOne({ where: { id: userID } });
  username = user.Username;
  const student = await Student.findOne({ where: { Username: username } });
  student.Status = 'waitapprove';
  student.save();
  console.log(req.body);
  const waitingList = await WaitingList.update(req.body, {
    where: {
      Partner_1: student.Username,
    },
  });

  console.log(waitingList);
  res.status(200).json({
    status: 'success',
    data: {
      waitingList,
    },
  });
});
getListForCurrentStudent = catchAsync(async (req, res, next) => {
  const userID = req.user.id;
  const user = await User.findOne({ where: { id: userID } });
  username = user.Username;
  const student = await Student.findOne({ where: { Username: username } });
  const waitingList = await WaitingList.findOne({
    where: {
      Partner_1: student.Username,
    },
  });
  res.status(200).json({
    status: 'success',
    data: {
      waitingList,
    },
  });
});
const { sequelize } = require('../models');

getListForCurrentDoctor = catchAsync(async (req, res, next) => {
  const userID = req.user.id;
  const user = await User.findOne({ where: { id: userID } });
  const username = user.Username;
  console.log(
    '****************************************************************',
  );
  console.log(username);
  console.log(
    '****************************************************************',
  );

  const doctor = await Doctor.findOne({ where: { Username: username } });

  const query = `
    SELECT 
      wl.List_ID,
      wl.Partner_1,
      wl.Partner_2,
      wl.ProjectType,
      wl.ProjectStatus,
      wl.PartnerStatus,
      wl.DoctorStatus,
      wl.Doctor1,
      wl.Doctor2,
      wl.Doctor3,
      wl.ProjectTitle,
      wl.ProjectDescription,
      wl.createdAt,
      wl.updatedAt,
      s.Username AS StudentUsername,
      s.Registration_number,
      s.Status
    FROM 
      WaitingLists wl
    LEFT JOIN 
      Students s 
    ON 
      wl.Partner_1 = s.Username
    WHERE 
      wl.Doctor1 = :doctorUsername 
      AND wl.DoctorStatus = 'waiting' 
      
  `;

  const replacements = { doctorUsername: doctor.Username };

  const [waitingList] = await sequelize.query(query, {
    replacements,
    type: sequelize.QueryTypes.SELECT,
  });

  res.status(200).json({
    status: 'success',
    data: {
      waitingList,
    },
  });
});

approveStudent = catchAsync(async (req, res, next) => {
  try {
    const userID = req.user.id;
    const studentUser = req.body.Username;

    const user = await User.findOne({ where: { id: userID } });
    const username = user.Username;

    const doctor = await Doctor.findOne({ where: { Username: username } });

    const waitingList = await WaitingList.update(
      { DoctorStatus: 'approved' },
      {
        where: {
          Doctor1: doctor.Username,
          DoctorStatus: 'waiting',
          Partner_1: studentUser,
        },
      },
    );

    const reservation = await Reservation.create({
      Student: studentUser,
      Doctor: doctor.Username,
    });
    const student = await Student.update(
      { Status: 'completed' },
      { where: { Username: studentUser } },
    );

    res.status(200).json({
      status: 'success',
      data: {
        reservation,
      },
    });
  } catch (error) {
    next(error);
  }
});

declineStudent = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const userID = req.user.id;
  const studentUser = req.body.Username;
  const user = await User.findOne({ where: { id: userID } });
  username = user.Username;
  const doctor = await Doctor.findOne({ where: { Username: username } });

  const waitingList = await WaitingList.update(
    { DoctorStatus: 'decline' },
    {
      where: {
        Doctor1: doctor.Username,
        DoctorStatus: 'waiting',
        Partner_1: studentUser,
      },
    },
  );
  const student = await Student.update(
    {
      Status: 'declineDoctor',
    },
    {
      where: { Username: studentUser },
    },
  );
  res.status(200).json({
    status: 'success',
    data: {
      student,
    },
  });
});
getProjectListForCurrentDoctor = catchAsync(async (req, res, next) => {
  const userID = req.user.id;
  const user = await User.findOne({ where: { id: userID } });
  const username = user.Username;
  const doctor = await Doctor.findOne({ where: { Username: username } });
  const waitingList = await WaitingList.findAll({
    where: {
      Doctor1: doctor.Username,
      ProjectStatus: 'waiting',
      ProjectTitle: { [Sequelize.Op.ne]: null },
      ProjectDescription: { [Sequelize.Op.ne]: null },
    },
  });
  res.status(200).json({
    status: 'success',
    data: {
      waitingList,
    },
  });
});

getProjectsCount = catchAsync(async (req, res, next) => {
  const userID = req.user.id;
  const user = await User.findOne({ where: { id: userID } });
  const username = user.Username;
  const doctor = await Doctor.findOne({ where: { Username: username } });
  const waitingList = await WaitingList.count({
    where: { Doctor1: doctor.Username, ProjectStatus: 'waiting' },
  });
  res.status(200).json({
    status: 'success',
    data: {
      waitingList,
    },
  });
});
getCount = catchAsync(async (req, res, next) => {
  const userID = req.user.id;
  const user = await User.findOne({ where: { id: userID } });
  const username = user.Username;
  const doctor = await Doctor.findOne({ where: { Username: username } });
  const count = await WaitingList.count({
    where: { DoctorStatus: 'waiting', Doctor1: doctor.Username },
  });
  res.status(200).json({
    status: 'success',
    data: {
      count,
    },
  });
});

approveProject = catchAsync(async (req, res, next) => {
  try {
    const userID = req.user.id;
    const studentUser = req.body.Username;

    const user = await User.findOne({ where: { id: userID } });
    const username = user.Username;

    const doctor = await Doctor.findOne({ where: { Username: username } });

    const waitingList = await WaitingList.update(
      {
        ProjectStatus: 'approved',
      },
      {
        where: {
          Doctor1: doctor.Username,

          Partner_1: studentUser,
        },
      },
    );

    const student = await Student.update(
      { Status: 'approved' },
      { where: { Username: studentUser } },
    );
    const partner = await WaitingPartner.findOne({
      where: { Partner_1: studentUser, PartnerStatus: 'approved' },
    });
    const findWaitingList = await WaitingList.findOne({
      where: {
        Partner_1: studentUser,
        Doctor1: doctor.Username,
        DoctorStatus: 'approved',
      },
    });
    const findWaitingList2 = await WaitingList.findOne({
      where: {
        Partner_1: partner.Partner_2,
        DoctorStatus: 'approved',
      },
    });
    const Supervisor_2 = null;
    if (findWaitingList2.Doctor1 != findWaitingList.Doctor1) {
      Supervisor_2 = findWaitingList2.Doctor1;
    }
    const addToProjects = await Projects.create({
      Student_1: partner.Partner_1,
      Student_2: partner.Partner_2,
      Supervisor_1: findWaitingList.Doctor1,
      Supervisor_2: Supervisor_2,
      GP_Type: findWaitingList.ProjectTitle,
      GP_Description: findWaitingList.ProjectDescription,
      GP_Title: findWaitingList.ProjectType,
      done: 'no',
    });
    res.status(200).json({
      status: 'success',
      data: {
        addToProjects,
      },
    });
  } catch (error) {
    next(error);
  }
});

declineProject = catchAsync(async (req, res, next) => {
  const userID = req.user.id;
  const studentUser = req.body.Username;
  const user = await User.findOne({ where: { id: userID } });
  username = user.Username;
  const doctor = await Doctor.findOne({ where: { Username: username } });

  const waitingList = await WaitingList.update(
    { ProjectStatus: 'decline', ProjectType: '', ProjectDiscription: '' },
    {
      where: {
        Doctor1: doctor.Username,
        ProjectStatus: 'waiting',
        Partner_1: studentUser,
      },
    },
  );
  const student = await Student.update(
    {
      Status: 'completed',
    },
    {
      where: { Username: studentUser },
    },
  );

  res.status(200).json({
    status: 'success',
    data: {
      waitingList,
    },
  });
});

checkPartner = catchAsync(async (req, res, next) => {
  const userID = req.user.id;
  const user = await User.findOne({ where: { id: userID } });
  const username = user.Username;
  const partner = req.body.partner;
  const student = await Student.findOne({ where: { Username: username } });
  const waitingList = await WaitingList.findOne({});
});

getThreeDoctors = catchAsync(async (req, res, next) => {
  const getThree = await WaitingList.findAll({
    where: {
      Doctor2: { [Sequelize.Op.ne]: null },
      Doctor3: { [Sequelize.Op.ne]: null },
    },
  });
  res.status(200).json({
    status: 'success',
    data: { getThree },
  });
});
acceptOneOfThree = catchAsync(async (req, res, next) => {
  const { student, Doctor } = req.body;
  const findList = await WaitingList.update(
    { Doctor1: Doctor, Doctor2: null, Doctor3: null, DoctorStatus: 'approved' },
    { where: { Partner_1: student } },
  );
  const reservation = await Reservation.create({
    Student: student,
    Doctor: Doctor,
  });
  const updateStudent = await Student.update(
    { Status: 'completed' },
    { where: { Username: student } },
  );

  res.status(200).json({
    status: 'success',
    data: { reservation },
  });
});

module.exports = {
  addToWaiting,
  updateWaiting,
  getListForCurrentStudent,
  getListForCurrentDoctor,
  approveStudent,
  declineStudent,
  getCount,
  getProjectListForCurrentDoctor,
  getProjectsCount,
  approveProject,
  declineProject,
  getThreeDoctors,
  acceptOneOfThree,
};
