const nodemailer = require('nodemailer');


const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // Use EMAIL_HOST (not HOST)
    port: process.env.EMAIL_PORT, // Use EMAIL_PORT (not PORT)
    secure: false, // For port 587 (TLS), secure should be false
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      ciphers: 'SSLv3', // Add this for compatibility with certain SMTP servers
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
