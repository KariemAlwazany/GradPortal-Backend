const express = require('express');
const path = require('path');
const AppError = require('./utils/appError');
const userRouter = require('./routes/userRouter');
const sellerRouter = require('./routes/sellerRouter');
const studentRouter = require('./routes/studentRouter');
const itemsRouter = require('./routes/itemsRouter');
const doctorRouter = require('./routes/doctorRouter');
const associations = require('./db_associations/associations');
const projectsRouter = require('./routes/projectsRouter');
const favProjectsRouter = require('./routes/favProjectsRouter');
const shopRouter = require('./routes/shopRouter');
const globalErrorHandler = require('./controllers/errorController');

const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/GP', limiter);
app.use('/GP/v1/users', userRouter);
app.use('/GP/v1/seller', sellerRouter);
app.use('/GP/v1/students', studentRouter);
app.use('/GP/v1/doctor', doctorRouter);
app.use('/GP/v1/seller/items', itemsRouter);
app.use('/GP/v1/seller/shop', shopRouter);
app.use('/GP/v1/projects', projectsRouter);
app.use('/GP/v1/projects/favorites', favProjectsRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
