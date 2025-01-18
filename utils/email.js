const nodemailer = require('nodemailer');


const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
  host: process.env.HOST,
  port: process.env.PORT,
  secure: false, // Use false for non-TLS connections
  auth: {
  user: process.env.EMAIL_USERNAME,
  pass: process.env.EMAIL_PASSWORD,
  },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
      },
  });
  
  const mailOptions = {
  from: 'Gradhub Inc. <GradHub@co.com>',
  to: options.email,
  subject: options.subject,
  text: options.message,
      html: options.html,
  };
  
  await transporter.sendMail(mailOptions);

}
module.exports = sendEmail;
