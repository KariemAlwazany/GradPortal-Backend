const admin = require('firebase-admin');
const { User } = require('../models/userModel');

// Function to send a notification
const sendNotification = async (token, title, body, additionalData = {}) => {
  const message = {
    notification: {
      title: title,
      body: body,
    },
    data: additionalData,
    token: token,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Notification sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error.message);
    throw new Error(`Failed to send notification: ${error.message}`);
  }
};

// Function to notify a user by ID
const notifyUserById = async (req, res) => {
  const { userId, title, body, additionalData } = req.body;

  console.log('Payload received in /notifyUser:', { userId, title, body, additionalData });

  // Validate userId
  // if (!userId || typeof userId !== 'number') {
  //   return res.status(400).json({ error: `Invalid userId: Expected a number, got ${typeof userId}` });
  // }

  try {
    // Fetch the user by primary key
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (!user.token) {
      return res.status(400).json({ error: 'User does not have a valid token' });
    }

    // Send the notification
    const response = await sendNotification(user.token, title, body, additionalData);
    return res.status(200).json({ success: true, response });
  } catch (error) {
    console.error('Error in notifyUserById:', error.message);
    return res.status(500).json({ error: `Failed to notify user: ${error.message}` });
  }
};

module.exports = {
  sendNotification,
  notifyUserById,
};
