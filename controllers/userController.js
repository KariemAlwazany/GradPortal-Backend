const db = require('./../models/userModel');
const factory = require('./factoryController');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const User = db.User;

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
exports.getDoctors = catchAsync(async (req, res, next) => {
  const doctors = await User.findAll({
    where: {
      Role: 'Doctor',
      approval: 'true',
    },
  });
  res.status(200).json({
    status: 'success',
    data: {
      doctors,
    },
  });
});
exports.getHeadDoctor = catchAsync(async (req, res, next) => {
  const doctors = await User.findOne({
    where: {
      Role: 'Head',
      approval: 'true',
    },
  });
  res.status(200).json({
    status: 'success',
    data: {
      doctors,
    },
  });
});
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordconfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400,
      ),
    );
  }
  req.body.role = undefined;
  const doc = await User.update(req.body, {
    where: {
      id: req.user.id,
    },
  });
  console.log(doc);
  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.destroy({
    where: {
      id: req.user.id,
    },
  });

  res.status(204).json({
    status: 'success',
    message: 'Deleted',
  });
});

exports.changeHeadDoctor = catchAsync(async (req, res, next) => {
  const { currentHead, newHead } = req.body;
  const doctor = await User.update(
    { Role: 'Doctor' },
    { where: { id: currentHead } },
  );
  const doctor1 = await User.update(
    { Role: 'Head' },
    { where: { id: newHead } },
  );
  res.status(200).json({
    status: 'success',
    message: 'Head Doctor Changed',
  });
});
exports.getDoctorsCount = catchAsync(async (req, res, next) => {
  const count = await User.count({
    where: {
      Role: 'Doctor',
      approval: 'true',
    },
  });
  res.status(200).json({
    status: 'success',
    data: {
      count,
    },
  });
});
exports.getStudentsCount = catchAsync(async (req, res, next) => {
  const count = await User.count({
    where: {
      Role: 'Student',
      approval: 'true',
    },
  });
  res.status(200).json({
    status: 'success',
    data: {
      count,
    },
  });
});
exports.getSellersCount = catchAsync(async (req, res, next) => {
  const count = await User.count({
    where: {
      Role: 'Seller',
      approval: 'true',
    },
  });
  res.status(200).json({
    status: 'success',
    data: {
      count,
    },
  });
});
exports.getNormalUserCount = catchAsync(async (req, res, next) => {
  const count = await User.count({
    where: {
      Role: 'User',
      approval: 'true',
    },
  });
  res.status(200).json({
    status: 'success',
    data: {
      count,
    },
  });
});

exports.updatePhoneNumber = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];  // Token should be sent as 'Bearer <token>'
    
    if (!token) {
      return next(new AppError('You are not logged in!', 401)); // Token not found
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Verify token with the JWT_SECRET

    const user = await User.findOne({
      where: { id: decoded.id },  // Use the ID from the decoded token
    });

    if (!user) {
      return next(new AppError('User not found', 404));  // User not found
    }

    let { phone_number } = req.body;

    // Debugging: Check if phone_number is being passed correctly
    console.log(`Current phone number: ${user.phone_number}, New phone number: ${phone_number}`);


    // Step 5: Update the user's phone number
    user.phone_number = phone_number;
    await user.save();  // Save changes to the database

    console.log(`Updated phone number: ${user.phone_number}`); // Debugging: Log the updated phone number

    // Step 6: Respond with success
    res.status(200).json({
      status: 'success',
      message: 'Phone number updated successfully',
    });
  } catch (err) {
    console.error(err);
    return next(new AppError('Something went wrong while updating phone number', 500));
  }
};




exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
