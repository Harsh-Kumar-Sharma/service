const logger = require('../config/logger');

const errorConverter = (err, req, res, next) => {
  const error = err;
  const { statusCode } = error;
  const { message } = error;
  next({
    statusCode,
    message,
  });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const { message } = err;
  res.locals.errorMessage = err.message;

  const response = {
    code: 417,
    message,
  };

  logger.error(response);
  res.status(417).send(response);
};

module.exports = {
  errorConverter,
  errorHandler,
};
