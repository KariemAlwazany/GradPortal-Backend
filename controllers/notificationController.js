const admin = require('firebase-admin');
const { User } = require('../models/userModel');
const db2 = require('./../models/reservationModel');
const db3 = require('./../models/projectsModel');
const { Sequelize } = require('sequelize');

const db4 = require('./../models/waitingModel');
const catchAsync = require('./../utils/catchAsync');
const Reservation = db2.Reservation;
const Projects = db3.Projects;
const WaitingList = db4.WaitingList;
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

  console.log('Payload received in /notifyUser:', {
    userId,
    title,
    body,
    additionalData,
  });

  try {
    // Fetch the user by primary key
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (!user.token) {
      return res
        .status(400)
        .json({ error: 'User does not have a valid token' });
    }

    // Save notification to Firestore
    const notificationId = await saveNotificationToFirestore(
      userId,
      title,
      body,
      additionalData,
    );
    console.log('Notification saved with ID:', notificationId);

    // Send the notification via FCM
    const response = await sendNotification(
      user.token,
      title,
      body,
      additionalData,
    );
    console.log('Notification sent successfully via FCM:', response);

    return res.status(200).json({
      success: true,
      message: 'Notification sent and saved successfully',
      notificationId,
      fcmResponse: response,
    });
  } catch (error) {
    console.error('Error in notifyUserById:', error.message);
    return res
      .status(500)
      .json({ error: `Failed to notify user: ${error.message}` });
  }
};
const notifyAdminsAndHeads = async (req, res) => {
  const { title, body, additionalData } = req.body;

  console.log('Payload received in /notifyAdminsAndHeads:', {
    title,
    body,
    additionalData,
  });

  try {
    // Fetch all users with the role 'Admin' or 'Head'
    const adminsAndHeads = await User.findAll({
      where: {
        Role: ['Admin', 'Head'],
      },
    });

    if (!adminsAndHeads || adminsAndHeads.length === 0) {
      return res.status(404).json({ error: 'No admins or heads found' });
    }

    const notifications = [];

    // Loop through each admin/head and send a notification
    for (const user of adminsAndHeads) {
      if (user.token) {
        // Save notification to Firestore
        const notificationId = await saveNotificationToFirestore(
          user.id,
          title,
          body,
          additionalData,
        );
        console.log(
          'Notification saved for user:',
          user.Username,
          'with ID:',
          notificationId,
        );

        // Send the notification via FCM
        const response = await sendNotification(
          user.token,
          title,
          body,
          additionalData,
        );
        console.log(
          'Notification sent successfully to user:',
          user.Username,
          'via FCM:',
          response,
        );

        notifications.push({
          userId: user.id,
          username: user.Username,
          notificationId,
          fcmResponse: response,
        });
      } else {
        console.warn(`User ${user.Username} does not have a valid token`);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Notifications sent and saved successfully',
      notifications,
    });
  } catch (error) {
    console.error('Error in notifyAdminsAndHeads:', error.message);
    return res
      .status(500)
      .json({ error: `Failed to notify admins and heads: ${error.message}` });
  }
};

const validateFCMToken = async (token) => {
  try {
    const response = await admin.messaging().send(
      {
        token: token,
        notification: {
          title: 'Test Notification',
          body: 'This is a test notification to validate the token.',
        },
      },
      true,
    ); // The second parameter (dryRun: true) ensures that the message is not actually sent

    console.log('Token is valid:', response);
    return true;
  } catch (error) {
    console.error('Token is invalid:', error);
    return false;
  }
};

// Modify your notifyUserByUsername function to include token validation
const notifyUserByUsername = async (req, res) => {
  const { username, title, body, additionalData } = req.body;

  console.log('Payload received in /notifyUser:', {
    username,
    title,
    body,
    additionalData,
  });

  try {
    // Fetch the user by primary key
    const user = await User.findOne({ where: { Username: username } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (!user.token) {
      return res
        .status(400)
        .json({ error: 'User does not have a valid token' });
    }

    // Validate the FCM token
    const isTokenValid = await validateFCMToken(user.token);
    if (!isTokenValid) {
      // If the token is invalid, update the user's record to remove the token
      await User.update({ token: null }, { where: { id: user.id } });
      return res.status(400).json({ error: 'Invalid FCM token' });
    }

    // Save notification to Firestore
    const notificationId = await saveNotificationToFirestore(
      user.id,
      title,
      body,
      additionalData,
    );
    console.log('Notification saved with ID:', notificationId);

    // Send the notification via FCM
    const response = await sendNotification(
      user.token,
      title,
      body,
      additionalData,
    );
    console.log('Notification sent successfully via FCM:', response);

    return res.status(200).json({
      success: true,
      message: 'Notification sent and saved successfully',
      notificationId,
      fcmResponse: response,
    });
  } catch (error) {
    console.error('Error in notifyUserById:', error.message);
    return res
      .status(500)
      .json({ error: `Failed to notify user: ${error.message}` });
  }
};
const notifyDocotrStudents = async (req, res) => {
  const { title, body, additionalData } = req.body;

  try {
    // Step 1: Fetch all students supervised by the doctor
    const studentsResponse = await fetch(
      `http://127.0.0.1:3000/GP/v1/doctors/students`,
      {
        headers: {
          Authorization: `Bearer ${req.user.token}`, // Use the doctor's token
        },
      },
    );

    if (!studentsResponse.ok) {
      throw new Error(
        `Failed to fetch students: ${studentsResponse.statusText}`,
      );
    }

    const studentsData = await studentsResponse.json();
    const allStudents = studentsData.data.allStudents;

    // Step 2: Loop through each project and notify Student_1 and Student_2
    for (const project of allStudents) {
      const student1 = project.Student1?.Username;
      const student2 = project.Student2?.Username;

      if (student1) {
        await notifyUserByUsernameHelper(student1, title, body, additionalData);
      }
      if (student2) {
        await notifyUserByUsernameHelper(student2, title, body, additionalData);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Notifications sent to all students successfully',
    });
  } catch (error) {
    console.error('Error in notifyAllStudents:', error.message);
    return res
      .status(500)
      .json({ error: `Failed to notify students: ${error.message}` });
  }
};
const notifyAllStudents = async (req, res) => {
  const { title, body, additionalData } = req.body;

  console.log('Payload received in /notifyAllStudents:', {
    title,
    body,
    additionalData,
  });

  try {
    // Fetch all users with the role "Student"
    const students = await User.findAll({ where: { Role: 'Student' } });

    if (!students || students.length === 0) {
      return res.status(404).json({ error: 'No students found' });
    }

    const notifications = [];

    // Loop through each student and send a notification
    for (const student of students) {
      if (!student.token) {
        console.warn(`User ${student.Username} does not have a valid token`);
        continue;
      }

      // Save notification to Firestore
      const notificationId = await saveNotificationToFirestore(
        student.id,
        title,
        body,
        additionalData,
      );
      console.log('Notification saved with ID:', notificationId);

      // Send the notification via FCM
      const response = await sendNotification(
        student.token,
        title,
        body,
        additionalData,
      );
      console.log('Notification sent successfully via FCM:', response);

      notifications.push({
        userId: student.id,
        username: student.Username,
        notificationId,
        fcmResponse: response,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Notifications sent and saved successfully',
      notifications,
    });
  } catch (error) {
    console.error('Error in notifyAllStudents:', error.message);
    return res
      .status(500)
      .json({ error: `Failed to notify students: ${error.message}` });
  }
};
const notifyGroup = async (req, res) => {
  const { title, body, additionalData } = req.body;

  console.log('Payload received in /notifyGroup:', {
    title,
    body,
    additionalData,
  });

  try {
    // Fetch the doctor's username from the authenticated user's ID
    const doctor = await User.findOne({ where: { id: req.user.id } });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Fetch the project where the doctor is the supervisor
    const group = await Projects.findOne({
      where: { GP_ID: req.params.groupID },
    });
    if (!group) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get the usernames of Student_1 and Student_2
    const student1Username = group.Student_1;
    const student2Username = group.Student_2;

    if (!student1Username || !student2Username) {
      return res
        .status(400)
        .json({ error: 'Students not found in the project' });
    }

    // Fetch the students' details
    const student1 = await User.findOne({
      where: { Username: student1Username },
    });
    const student2 = await User.findOne({
      where: { Username: student2Username },
    });

    if (!student1 || !student2) {
      return res.status(404).json({ error: 'One or both students not found' });
    }

    // Convert additionalData values to strings
    const stringifiedAdditionalData = {};
    for (const key in additionalData) {
      if (additionalData.hasOwnProperty(key)) {
        stringifiedAdditionalData[key] = String(additionalData[key]);
      }
    }

    // Notify Student_1
    let notificationId1, response1;
    if (student1.token) {
      notificationId1 = await saveNotificationToFirestore(
        student1.id,
        title,
        body,
        stringifiedAdditionalData,
      );
      console.log('Notification saved for Student_1 with ID:', notificationId1);

      response1 = await sendNotification(
        student1.token,
        title,
        body,
        stringifiedAdditionalData,
      );
      console.log(
        'Notification sent successfully to Student_1 via FCM:',
        response1,
      );
    } else {
      console.warn('Student_1 does not have a valid token');
    }

    // Notify Student_2
    let notificationId2, response2;
    if (student2.token) {
      notificationId2 = await saveNotificationToFirestore(
        student2.id,
        title,
        body,
        stringifiedAdditionalData,
      );
      console.log('Notification saved for Student_2 with ID:', notificationId2);

      response2 = await sendNotification(
        student2.token,
        title,
        body,
        stringifiedAdditionalData,
      );
      console.log(
        'Notification sent successfully to Student_2 via FCM:',
        response2,
      );
    } else {
      console.warn('Student_2 does not have a valid token');
    }

    return res.status(200).json({
      success: true,
      message: 'Notifications sent and saved successfully',
      notifications: [
        {
          student: student1Username,
          notificationId: notificationId1,
          fcmResponse: response1,
        },
        {
          student: student2Username,
          notificationId: notificationId2,
          fcmResponse: response2,
        },
      ],
    });
  } catch (error) {
    console.error('Error in notifyGroup:', error.message);
    return res
      .status(500)
      .json({ error: `Failed to notify group: ${error.message}` });
  }
};
const notifyAllDoctors = async (req, res) => {
  const { title, body, additionalData } = req.body;

  console.log('Payload received in /notifyAllDoctors:', {
    title,
    body,
    additionalData,
  });

  try {
    // Fetch all users with the role "Doctor"
    const doctors = await User.findAll({ where: { Role: 'Doctor' } });

    if (!doctors || doctors.length === 0) {
      return res.status(404).json({ error: 'No doctors found' });
    }

    const notifications = [];

    // Loop through each doctor and send a notification
    for (const doctor of doctors) {
      if (!doctor.token) {
        console.warn(`User ${doctor.Username} does not have a valid token`);
        continue;
      }

      // Save notification to Firestore
      const notificationId = await saveNotificationToFirestore(
        doctor.id,
        title,
        body,
        additionalData,
      );
      console.log('Notification saved with ID:', notificationId);

      // Send the notification via FCM
      const response = await sendNotification(
        doctor.token,
        title,
        body,
        additionalData,
      );
      console.log('Notification sent successfully via FCM:', response);

      notifications.push({
        userId: doctor.id,
        username: doctor.Username,
        notificationId,
        fcmResponse: response,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Notifications sent and saved successfully',
      notifications,
    });
  } catch (error) {
    console.error('Error in notifyAllDoctors:', error.message);
    return res
      .status(500)
      .json({ error: `Failed to notify doctors: ${error.message}` });
  }
};
const notifyUserByUsernameHelper = async (
  username,
  title,
  body,
  additionalData,
) => {
  try {
    const response = await fetch(
      `${dotenv.env['API_BASE_URL']}/GP/v1/notification/notifyUserByUsername`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.DOCTOR_TOKEN}`, // Use the doctor's token
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          title,
          body,
          additionalData,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to notify user ${username}: ${response.statusText}`,
      );
    }

    const result = await response.json();
    console.log(`Notification sent to ${username}:`, result);
  } catch (error) {
    console.error(`Error notifying user ${username}:`, error.message);
  }
};
const notifyDoctor = async (req, res) => {
  const { title, body, additionalData } = req.body;
  const userID = req.user.id;
  const user = await User.findOne({ where: { id: userID } });
  const reservation = await Reservation.findOne({
    where: { Student: user.Username },
  });
  const doctor = reservation.Doctor;
  console.log('Payload received in /notifyUser:', {
    doctor,
    title,
    body,
    additionalData,
  });

  try {
    // Fetch the user by primary key

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (!user.token) {
      return res
        .status(400)
        .json({ error: 'User does not have a valid token' });
    }

    // Save notification to Firestore
    const notificationId = await saveNotificationToFirestore(
      user.id,
      title,
      body,
      additionalData,
    );
    console.log('Notification saved with ID:', notificationId);

    // Send the notification via FCM
    const response = await sendNotification(
      user.token,
      title,
      body,
      additionalData,
    );
    console.log('Notification sent successfully via FCM:', response);

    return res.status(200).json({
      success: true,
      message: 'Notification sent and saved successfully',
      notificationId,
      fcmResponse: response,
    });
  } catch (error) {
    console.error('Error in notifyUserById:', error.message);
    return res
      .status(500)
      .json({ error: `Failed to notify user: ${error.message}` });
  }
};
const getNotificationsByUser = async (req, res) => {
  const userId = req.params.userId;
  console.log(
    'Querying notifications for userId:',
    userId,
    'Type:',
    typeof userId,
  );

  try {
    // Validate userId
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    const allDocsSnapshot = await admin
      .firestore()
      .collection('UserNotifications')
      .get();
    allDocsSnapshot.forEach((doc) => {
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
    const notifications = snapshot.docs.map((doc) => ({
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
const notifyMyStudents = async (req, res) => {
  const { title, body, additionalData } = req.body;

  console.log('Payload received in /notifyMyStudents:', {
    title,
    body,
    additionalData,
  });

  try {
    // Get the current doctor's ID from the authenticated user
    const doctorID = req.user.id;

    // Fetch the doctor's details
    const doctor = await User.findOne({ where: { id: doctorID } });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Fetch all reservations for the current doctor
    const reservations = await Reservation.findAll({
      where: { Doctor: doctor.Username },
    });

    if (!reservations || reservations.length === 0) {
      return res
        .status(404)
        .json({ error: 'No reservations found for this doctor' });
    }

    const notifications = [];

    // Loop through each reservation
    for (const reservation of reservations) {
      // Get the student's username from the reservation
      const studentUsername = reservation.Student;

      // Fetch the student's details
      const student = await User.findOne({
        where: { Username: studentUsername },
      });

      if (!student) {
        console.warn(`Student ${studentUsername} not found`);
        continue;
      }

      // Notify the student if they have a valid token
      if (student.token) {
        // Save notification to Firestore
        const notificationId = await saveNotificationToFirestore(
          student.id,
          title,
          body,
          additionalData,
        );
        console.log(
          'Notification saved for student:',
          student.Username,
          'with ID:',
          notificationId,
        );

        // Send the notification via FCM
        const response = await sendNotification(
          student.token,
          title,
          body,
          additionalData,
        );
        console.log(
          'Notification sent successfully to student:',
          student.Username,
          'via FCM:',
          response,
        );

        notifications.push({
          student: student.Username,
          notificationId,
          fcmResponse: response,
        });
      } else {
        console.warn(`Student ${student.Username} does not have a valid token`);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Notifications sent and saved successfully',
      notifications,
    });
  } catch (error) {
    console.error('Error in notifyMyStudents:', error.message);
    return res
      .status(500)
      .json({ error: `Failed to notify students: ${error.message}` });
  }
};
const notifyDoctorforNewRequest = async (req, res) => {
  const { title, body, additionalData } = req.body;
  const userID = req.user.id;
  const user = await User.findOne({ where: { id: userID } });
  const waitingList = await WaitingList.findOne({
    where: {
      [Sequelize.Op.or]: [
        { Partner_1: user.Username },
        { Partner_2: user.Username },
      ],
    },
  });
  const doctor = waitingList.Doctor1;
  console.log('Payload received in /notifyUser:', {
    doctor,
    title,
    body,
    additionalData,
  });

  try {
    // Fetch the user by primary key

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (!user.token) {
      return res
        .status(400)
        .json({ error: 'User does not have a valid token' });
    }

    // Save notification to Firestore
    const notificationId = await saveNotificationToFirestore(
      user.id,
      title,
      body,
      additionalData,
    );
    console.log('Notification saved with ID:', notificationId);

    // Send the notification via FCM
    const response = await sendNotification(
      user.token,
      title,
      body,
      additionalData,
    );
    console.log('Notification sent successfully via FCM:', response);

    return res.status(200).json({
      success: true,
      message: 'Notification sent and saved successfully',
      notificationId,
      fcmResponse: response,
    });
  } catch (error) {
    console.error('Error in notifyUserById:', error.message);
    return res
      .status(500)
      .json({ error: `Failed to notify user: ${error.message}` });
  }
};
const saveNotificationToFirestore = async (
  userId,
  title,
  body,
  additionalData,
) => {
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
    throw new Error(
      `Failed to save notification to Firestore: ${error.message}`,
    );
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
    const notificationRef = admin
      .firestore()
      .collection('UserNotifications')
      .doc(notificationId);

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
  markNotificationAsRead,
  notifyUserByUsername,
  notifyDoctor,
  notifyAllStudents,
  notifyAllDoctors,
  notifyGroup,
  notifyMyStudents,
  notifyAdminsAndHeads,
  notifyDoctorforNewRequest,
};
