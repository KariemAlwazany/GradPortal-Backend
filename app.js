const express = require('express');
const path = require('path');
const AppError = require('./utils/appError');
const userRouter = require('./routes/userRouter');
const sellerRouter = require('./routes/sellerRouter');
const studentRouter = require('./routes/studentRouter');

const doctorRouter = require('./routes/doctorRouter');
const associations = require('./db_associations/associations');
// const weatherRouter = require('./routes/externalApiWeatherRouter');
// const soilRouter = require('./routes/externalApiSoilRouter');
const globalErrorHandler = require('./controllers/errorController');
// const viewRouter = require('./routes/viewRouter');
// const partnershipRouter = require('./routes/partnershipRouter');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

// const cropsRouter = require('./routes/cropsRouter');
const app = express();
// app.set('view engine', 'pug');
// app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
// app.use('/', viewRouter);
app.use('/GreenThumb', limiter);
app.use('/GreenThumb/v1/users', userRouter);
app.use('/GreenThumb/v1/seller', sellerRouter);
app.use('/GreenThumb/v1/student', studentRouter);
app.use('/GreenThumb/v1/doctor', doctorRouter);
// app.use('/GreenThumb/v1/crops', cropsRouter);
// app.use('/GreenThumb/v1/gardens', gardenRouter);
// app.use('/GreenThumb/v1/plots', plotsRouter);
// app.use('/GreenThumb/v1/events', eventsRouter);
// app.use('/GreenThumb/v1/externalapi/weather', weatherRouter);
// app.use('/GreenThumb/v1/externalapi/soil', soilRouter);

// app.use('/GreenThumb/v1/partnerships', partnershipRouter);

// app.use('/GreenThumb/v1/resources', resourcesRouter);
// app.use('/GreenThumb/v1/articles', articlesRouter);

// app.use('/GreenThumb/v1/externalapis', weatherRouter);
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
