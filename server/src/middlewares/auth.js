const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
// const { roleRights } = require('../config/enum');
/* eslint-disable */

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Session expired. Please login again.'));
  }
  req.user = user;

  if (requiredRights.length) {
    // const userRights = roleRights.get(user);
    // if (!userRights || !user) return reject(new ApiError(httpStatus.FORBIDDEN, 'Permissions denied'));

    // const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
    // if (!hasRequiredRights) {
    //   return reject(new ApiError(httpStatus.FORBIDDEN, 'Permissions denied'));
    // }
  }

  resolve();
};

const auth =
  (...requiredRights) =>
    async (req, res, next) => {
      return new Promise((resolve, reject) => {
        passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
      })
        .then(() => next())
        .catch((err) => next(err));
    };

module.exports = auth;
