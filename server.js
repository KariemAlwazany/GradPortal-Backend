const dotenv = require('dotenv');
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(
    require('../SW_GP/utils/serviceAccountKey.json'),
  ),
});

const firestore = admin.firestore();
firestore.settings({
  ignoreUndefinedProperties: true,
});

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});
dotenv.config({ path: './.env' });
const app = require('./app');
const port = process.env.PORT || 3000;
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
