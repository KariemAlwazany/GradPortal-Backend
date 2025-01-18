const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME, // Your Gmail address
      pass: process.env.EMAIL_PASSWORD, // Your Gmail app password
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates
    },
  });

  const mailOptions = {
    from: 'GradeHub Inc. <GradeHub@co.com>', // Sender address
    to: options.email, // Recipient's email address
    subject: options.subject, // Email subject
    text: options.message, // Plain text body
    html: options.html, // HTML body (if any)
  };

  await transporter.sendMail(mailOptions);
};
module.exports = sendEmail;
