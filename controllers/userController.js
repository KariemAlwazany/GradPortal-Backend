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
exports.deleteUserByUserName = catchAsync(async (req, res, next) => {
  await User.destroy({
    where: {
      Usernmae: req.params.Username,
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
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new AppError('You are not logged in!', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({
      where: { id: decoded.id },
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    let { phone_number } = req.body;

    console.log(`Current phone number: ${user.phone_number}, New phone number: ${phone_number}`);


    user.phone_number = phone_number;
    await user.save();

    console.log(`Updated phone number: ${user.phone_number}`);

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

// userController.js
exports.updateToken = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id; 

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.token = token;
    await user.save();

    res.status(200).json({ success: true, message: 'Token updated successfully' });
  } catch (error) {
    console.error('Error updating token:', error.message);
    res.status(500).json({ error: 'Failed to update token' });
  }
};




const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    // Validate the query parameter
    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Search users by Username or FullName (case-insensitive)
    const users = await User.findAll({
      where: {
        [Op.or]: [
          { Username: { [Op.iLike]: `%${query}%` } },
          { FullName: { [Op.iLike]: `%${query}%` } },
        ],
      },
      attributes: ['id', 'Username', 'FullName'], // Return only necessary fields
    });

    // Return the search results
    res.status(200).json({
      message: 'Users retrieved successfully',
      users,
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
};




const updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.user; // Retrieve user ID from the authenticated user
  const {
    Username,
    FullName,
    Email,
    Password,
    phone_number,
    longitude,
    latitude,
    city,
  } = req.body;

  // Find the user by ID
  const user = await User.findOne({
    where: { id },
  });

  if (!user) {
    return next(new AppError('No user found with the given ID', 404));
  }

  const updates = {};

  // Add fields to update if provided in the request
  if (Username) updates.Username = Username;
  if (FullName) updates.FullName = FullName;
  if (Email) updates.Email = Email;
  if (phone_number) updates.phone_number = phone_number;
  if (longitude) updates.longitude = longitude;
  if (latitude) updates.latitude = latitude;
  if (city) updates.city = city;

  if (Password) {
    const bcrypt = require('bcryptjs');
    updates.Password = await bcrypt.hash(Password, 12); // Hash the new password
  }

  // If there are no fields to update, return an error
  if (Object.keys(updates).length === 0) {
    return next(new AppError('No fields to update provided', 400));
  }

  // Update the user record
  const [updatedRows] = await User.update(updates, {
    where: { id },
  });

  if (updatedRows === 0) {
    return next(new AppError('Failed to update the user record', 500));
  }

  res.status(200).json({
    status: 'success',
    message: 'User updated successfully',
    data: {
      user: updates,
    },
  });
});

exports.updateUsers = updateUser;
exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.updateUserLocation = updateUserLocation;
exports.searchUsers = searchUsers;
