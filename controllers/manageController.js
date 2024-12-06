const db = require('./../models/manageModel');
const db1 = require('./../models/deadlinesModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const { Sequelize } = require('sequelize');

const Manage = db.Manage;
const Deadline = db1.Deadline;
const fetchDates = catchAsync(async (req, res, next) => {
  const fetchDates = await Manage.findAll();
  res.status(200).json({
    status: 'success',
    data: {
      fetchDates,
    },
  });
});

const checkJoin = catchAsync(async (req, res, next) => {
  const currentDate = new Date();

  const check = await Manage.findOne({});

  const joinApplicationDate = new Date(check.JoinApplication);

  if (check.JoinApplicationStatus == 'Show') {
    if (currentDate < joinApplicationDate) {
      next();
    } else {
      return next(new AppError('Cannot Join Application at this time', 401));
    }
  } else {
    next();
  }
});
const checkFindPartner = catchAsync(async (req, res, next) => {
  const currentDate = new Date();

  const check = await Manage.findOne({});

  const checkFindPartneDate = new Date(check.FindPartners);
  if (check.FindPartnersStatus == 'Show') {
    if (currentDate < checkFindPartneDate) {
      next();
    } else {
      res.status(404).json({
        status: 'fail',
        message: 'Cannot Join Application at this Time',
      });
    }
  } else {
    next();
  }
});
const checkFindDoctor = catchAsync(async (req, res, next) => {
  const currentDate = new Date();

  const check = await Manage.findOne({});

  const checkFindDoctorDate = new Date(check.FindDoctor);
  if (check.FindDoctorStatus == 'Show') {
    if (currentDate < checkFindDoctor) {
      next();
    } else {
      res.status(404).json({
        status: 'fail',
        message: 'Cannot Find Doctor at this Time',
      });
    }
  } else {
    next();
  }
});
const checkAbstractSubmission = catchAsync(async (req, res, next) => {
  const currentDate = new Date();

  const check = await Manage.findOne({});

  const checkAbstractSubmissionDate = new Date(check.AbstractSubmission);
  if (check.FindDoctorStatus == 'Show') {
    if (currentDate < checkAbstractSubmissionDate) {
      next();
    } else {
      res.status(404).json({
        status: 'fail',
        message: 'Cannot Find Doctor at this Time',
      });
    }
  } else {
    next();
  }
});
const checkFinalSubmission = catchAsync(async (req, res, next) => {
  const currentDate = new Date();
  const check = await Manage.findOne({});
  const checkFinalSubmissionDate = new Date(check.FinalSubmission);
  if (check.FinalSubmissionStatus == 'Show') {
    if (currentDate < checkFinalSubmissionDate) {
      next();
    } else {
      res.status(404).json({
        status: 'fail',
        message: 'Cannot Find Doctor at this Time',
      });
    }
  } else {
    next();
  }
});
const update = catchAsync(async (req, res, next) => {
  console.log(
    '******************************** ********************************',
  );
  console.log(req.body);
  console.log(
    '******************************** ********************************',
  );

  // Ensure SubmitAbstract and FinalSubmission are in the correct format before updating
  if (req.body.SubmitAbstract) {
    req.body.SubmitAbstract = new Date(req.body.SubmitAbstract).toISOString(); // Convert to ISO string format
  }

  if (req.body.FinalSubmission) {
    req.body.FinalSubmission = new Date(req.body.FinalSubmission).toISOString(); // Convert to ISO string format
  }

  const data = await Manage.update(req.body, { where: {} });

  if (req.body.SubmitAbstract) {
    const findDeadline = await Deadline.findOne({
      where: { Title: 'Abstract Submission' },
    });
    if (!findDeadline) {
      const createDeadline = await Deadline.create({
        Doctor: 'Head',
        Date: req.body.SubmitAbstract,
        Title: 'Abstract Submission',
      });
    } else {
      await Deadline.update(
        { Date: req.body.SubmitAbstract },
        {
          where: { Title: 'Abstract Submission' },
        },
      );
    }
  } else if (req.body.FinalSubmission) {
    const findDeadline = await Deadline.findOne({
      where: { Title: 'Final Submission' },
    });
    if (!findDeadline) {
      const createDeadline = await Deadline.create({
        Doctor: 'Head',
        Date: req.body.FinalSubmission,
        Title: 'Final Submission',
      });
    } else {
      await Deadline.update(
        { Date: req.body.FinalSubmission },
        {
          where: { Title: 'Final Submission' },
        },
      );
    }
  } else if (req.body.FinalSubmissionStatus) {
    if (req.body.FinalSubmissionStatus == 'Hide') {
      const findDeadline = await Deadline.findOne({
        where: { Title: 'Final Submission' },
      });
      if (findDeadline) {
        await Deadline.destroy({ where: { Title: 'Final Submission' } });
      }
    } else if (req.body.FinalSubmissionStatus == 'Show') {
      const getdate = await Manage.findOne({ where: {} });
      const createDeadline = await Deadline.create({
        Doctor: 'Head',
        Date: getdate.FinalSubmission,
        Title: 'Final Submission',
      });
    }
  } else if (req.body.SubmitAbstractStatus) {
    if (req.body.SubmitAbstractStatus == 'Hide') {
      const findDeadline = await Deadline.findOne({
        where: { Title: 'Abstract Submission' },
      });
      if (findDeadline) {
        await Deadline.destroy({ where: { Title: 'Abstract Submission' } });
      }
    } else if (req.body.SubmitAbstractStatus == 'Show') {
      const getdate = await Manage.findOne({ where: {} });
      const createDeadline = await Deadline.create({
        Doctor: 'Head',
        Date: getdate.SubmitAbstract,
        Title: 'Abstract Submission',
      });
    }
  }
  res.status(200).json({
    status: 'success',
    data: data,
  });
});

module.exports = {
  update,
  checkJoin,
  checkFindPartner,
  checkFindDoctor,
  checkAbstractSubmission,
  checkFinalSubmission,
  fetchDates,
};
