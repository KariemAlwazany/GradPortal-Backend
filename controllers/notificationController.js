const admin = require('firebase-admin');
const { User } = require('../models/userModel');


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

  try {
    // Fetch the user by primary key
    const user = await User.findOne({where: { id: userId}});
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    console.log(user.token);
    if (!user.token) {
      return res.status(400).json({ error: 'User does not have a valid token' });
    }

    // Save notification to Firestore
    const notificationId = await saveNotificationToFirestore(userId, title, body, additionalData);
    console.log('Notification saved with ID:', notificationId);

    // Send the notification via FCM
    const response = await sendNotification(user.token, title, body, additionalData);
    console.log('Notification sent successfully via FCM:', response);

    return res.status(200).json({
      success: true,
      message: 'Notification sent and saved successfully',
      notificationId,
      fcmResponse: response,
    });
  } catch (error) {
    console.error('Error in notifyUserById:', error.message);
    return res.status(500).json({ error: `Failed to notify user: ${error.message}` });
  }
};





const getNotificationsByUser = async (req, res) => {
  const userId = req.params.userId;
  console.log('Querying notifications for userId:', userId, 'Type:', typeof userId);

  try {
    // Validate userId
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    const allDocsSnapshot = await admin.firestore().collection('UserNotifications').get();
    allDocsSnapshot.forEach(doc => {
      console.log('Document:', doc.id, 'Data:', doc.data());
    });
    
    // Reference to the Firestore collection
    const notificationsRef = admin.firestore().collection('UserNotifications');
    const userIdAsNumber = parseInt(userId, 10); // If Firestore stores userId as a number

    // Query notifications for the specific user
    const snapshot = await notificationsRef
      .where('userId', '==', userIdAsNumber)
      .orderBy('createdAt', 'desc') // Match the correct field name
      .get();

    // Handle no notifications found
    if (snapshot.empty) {
      return res.status(404).json({ message: 'No notifications found' });
    }

    // Map the notifications to a response format
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({
      message: 'Notifications retrieved successfully',
      notifications,
    });
  } catch (error) {
    // Check if the error is related to missing index
    if (error.code === 9 && error.details.includes('requires an index')) {
      console.error('Missing Firestore Index:', error.details);
      res.status(400).json({
        error: 'Firestore index required',
        indexDetails: error.details,
      });
    } else {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  }
};





const saveNotificationToFirestore = async (userId, title, body, additionalData) => {
  try {
    const notificationData = {
      userId,
      title,
      message: body,
      additionalData,
      createdAt: admin.firestore.Timestamp.now(),
      isRead: false, // Mark as unread by default
    };

    const notificationRef = admin.firestore().collection('UserNotifications');
    const docRef = await notificationRef.add(notificationData);
    console.log('Notification saved to Firestore with ID:', docRef.id);

    return docRef.id;
  } catch (error) {
    console.error('Error saving notification to Firestore:', error.message);
    throw new Error(`Failed to save notification to Firestore: ${error.message}`);
  }
};





const getNotificationCountByUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    // Validate userId
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Reference to the Firestore collection
    const notificationsRef = admin.firestore().collection('UserNotifications');
    const userIdAsNumber = parseInt(userId, 10); // If Firestore stores userId as a number

    // Query for unread notifications (assuming you track with `isRead`)
    const snapshot = await notificationsRef
      .where('userId', '==', userIdAsNumber)
      .where('isRead', '==', false) // Filter unread notifications
      .get();

    // Count the documents
    const notificationCount = snapshot.size;

    res.status(200).json({
      message: 'Notification count retrieved successfully',
      userId,
      notificationCount,
    });
  } catch (error) {
    console.error('Error fetching notification count:', error);
    res.status(500).json({ error: 'Failed to fetch notification count' });
  }
};





const markNotificationAsRead = async (req, res) => {
  const { notificationId } = req.params;

  try {
    if (!notificationId) {
      return res.status(400).json({ error: 'Notification ID is required' });
    }

    // Reference to the Firestore document
    const notificationRef = admin.firestore().collection('UserNotifications').doc(notificationId);

    // Get the notification document
    const notificationDoc = await notificationRef.get();

    if (!notificationDoc.exists) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Update the notification's isRead field
    await notificationRef.update({ isRead: true });

    res.status(200).json({
      message: 'Notification marked as read successfully',
      notificationId,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};
module.exports = {
  sendNotification,
  notifyUserById,
  getNotificationsByUser,
  getNotificationCountByUser,
  saveNotificationToFirestore,
  markNotificationAsRead
};
