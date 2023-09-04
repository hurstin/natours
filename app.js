const path = require('path');
const express = require('express');
const { json } = require('express/lib/response');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoute');
const bookingRouter = require('./routes/bookingRoute');
const viewRouter = require('./routes/viewRoute');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//global MIDDLEWARES
// serving static files
app.use(express.static(path.join(__dirname, 'public')));

// set security http headers
// app.use(helmet());
app.use(helmet({ contentSecurityPolicy: false }));

// development logging
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, try again in an hour',
});
app.use('/api', limiter);

// body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// data sanitization against noSQL query injection
app.use(mongoSanitize());

// data sanitization against XSS
app.use(xss());

// prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingQuantity',
      'ratingAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// serving static files
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  console.log('hello from the middleware');
  next();
});

// test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// app.get('/', (req, res) => {
//   res.status(200).json({ message: 'hello from the server', app: 'natours' });
// });

// app.post('/', (req, res) => {
//   res.send('you can post to this endpoint ');
// });

// ROUTE HANDLERS

// ROUTE

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  // res.status(400).json({
  //   status: 'fail',
  //   message: `can't find ${req.originalUrl} on this server`,
  // });

  // const err = new Error(`can't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

// START SERVER

module.exports = app;
