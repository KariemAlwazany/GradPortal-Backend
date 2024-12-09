const db = require('./../models/userModel');
const factory = require('./factoryController');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const User = db.User;
const axios = require('axios');

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




const updateUserLocation = async (req, res, next) => {
  try {
    // Extract JWT token from headers
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return next(new AppError('You are not logged in!', 401));
    }

    // Decode the JWT token to get the user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Find the user in the database
    const user = await User.findByPk(userId);
    if (!user) {
      return next(new AppError('User not found!', 404));
    }

    // Get latitude and longitude from the request body
    const { latitude, longitude } = req.body;
    if (!latitude || !longitude) {
      return next(new AppError('Latitude and longitude are required!', 400));
    }

    // Use reverse geocoding to get the city
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    const geocodingResponse = await axios.get(geocodingUrl);

    if (geocodingResponse.data.status !== 'OK') {
      console.error('Geocoding API error:', geocodingResponse.data);
      return next(new AppError('Failed to get the city from coordinates!', 500));
    }

    const addressComponents = geocodingResponse.data.results[0]?.address_components || [];
    const cityComponent = addressComponents.find((component) =>
      component.types.includes('locality')
    ) || addressComponents.find((component) =>
      component.types.includes('administrative_area_level_1')
    );

    if (!cityComponent) {
      console.error('City not found in geocoding response:', addressComponents);
      return next(new AppError('City not found in geocoding response!', 404));
    }

    const city = cityComponent.long_name;

    // Update user's location in the database
    user.latitude = latitude;
    user.longitude = longitude;
    user.city = city;

    await user.save();

    // Send response
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          latitude: user.latitude,
          longitude: user.longitude,
          city: user.city,
        },
      },
    });
  } catch (error) {
    next(error); // Pass error to global error handling middleware
  }
};

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.updateUserLocation = updateUserLocation;
