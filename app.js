const express = require('express');
const path = require('path');
const AppError = require('./utils/appError');
const userRouter = require('./routes/userRouter');
const sellerRouter = require('./routes/sellerRouter');
const studentRouter = require('./routes/studentsRouter');
const waitingRouter = require('./routes/waitingRouter');
const waitingPartnerRouter = require('./routes/waitingPartnerRouter');
const doctorRouter = require('./routes/doctorRouter');
const deadlineRouter = require('./routes/deadlineRouter');
const submitRouter = require('./routes/submitRouter');
const adminRouter = require('./routes/adminRouter');
const associations = require('./db_associations/associations');
const projectsRouter = require('./routes/projectsRouter');
const favProjectsRouter = require('./routes/favProjectsRouter');
const meetingsRouter = require('./routes/meetingsRouter');
const messagesRouter = require('./routes/messagesRouter');
const globalErrorHandler = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const itemsRouter = require('./routes/itemsRouter');
const shopRouter = require('./routes/shopRouter');
const tableRouter = require('./routes/tableRouter');
const roomRouter = require('./routes/roomRouter');
const removePartnerRouter = require('./routes/removePartnerRouter');

const manageRouter = require('./routes/manageRouter');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  }),
);

app.use(express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Middleware for parsing cookies and JSON requests
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));

// Rate limiting to prevent abuse
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/GP', limiter);

// Mounting routers
app.use('/GP/v1/users', userRouter);
app.use('/GP/v1/seller', sellerRouter);
app.use('/GP/v1/students', studentRouter);
app.use('/GP/v1/doctors', doctorRouter);
app.use('/GP/v1/projects', projectsRouter);
app.use('/GP/v1/projects/favorites', favProjectsRouter);
app.use('/GP/v1/projects/WaitingList', waitingRouter);
app.use('/GP/v1/WaitingPartnerList', waitingPartnerRouter);
app.use('/GP/v1/admin', adminRouter);
app.use('/GP/v1/meetings', meetingsRouter);
app.use('/GP/v1/deadlines', deadlineRouter);
app.use('/GP/v1/submit', submitRouter);
app.use('/GP/v1/messages', messagesRouter);
app.use('/GP/v1/seller/items', itemsRouter);
app.use('/GP/v1/seller/shop', shopRouter);
app.use('/GP/v1/table', tableRouter);
app.use('/GP/v1/room', roomRouter);
app.use('/GP/v1/manage', manageRouter);

app.use('/GP/v1/remove-partner', removePartnerRouter);
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
