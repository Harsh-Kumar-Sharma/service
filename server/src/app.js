const express = require('express');
const fileUpload = require('express-fileupload');
const helmet = require('helmet');
const xss = require('xss-clean');
const compression = require('compression');
const cors = require('cors');
const httpStatus = require('http-status');
const path = require('path');
const config = require('./config/config');
const morgan = require('./config/morgan');
// const { authLimiter } = require('./middlewares/rateLimiter');
// const routes = require('./routes');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// file upload
app.use(fileUpload({ createParentPath: true }));

// parse json request body
app.use(express.json({ limit: '20mb' }));

// parse urlencoded request body
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// sanitize request data
app.use(xss());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());



// // limit repeated failed requests to auth endpoints
// if (config.env === 'production') {
//   app.use('/service', authLimiter);
// }

// // v1 api routes
// app.use('/service', routes);

// Serves all the request which includes /images in the url from Images folder
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
app.use('/uploads/avatars', express.static(path.join(__dirname, '/uploads/avatars')));

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
