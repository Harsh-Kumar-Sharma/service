/* eslint-disable */
const { Sequelize, DataTypes } = require('sequelize');
const moment = require('moment-timezone');
const config = require('../config/config');
const logger = require('../config/logger');
let sequelize = null;
const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);
let db = {};
let isMssqlConnected = false;


// Override timezone formatting
Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  date = this._applyTimezone(date, options);

  // Use 'Asia/Kolkata' timezone for Indian Standard Time (IST)
  date = moment.tz(date, 'Asia/Kolkata');

  // Format dates in the Indian format: 'YYYY-MM-DD HH:mm:ss.SSS'
  return date.format('YYYY-MM-DD HH:mm:ss.SSS');
};

sequelize = new Sequelize(config.mssql.database, config.mssql.user, config.mssql.password, {
  host: config.mssql.host,
  dialect: 'mssql',

  pool: {
    max: 20,
    min: 5,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: {
    options: {
      requestTimeout: 1000000, // Set request timeout (in milliseconds)
    },
    supportBigNumbers: true
  },
  logging: false,
});

sequelize
  .authenticate()
  .then(() => {
    fs.readdirSync(__dirname)
      .filter((file) => {
        return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js';
      })
      .forEach((file) => {
        const model = require(path.join(__dirname, file))(sequelize, DataTypes);
        db[model.name] = model;
      });

    Object.keys(db).forEach((modelName) => {
      if (db[modelName].associate) {
        db[modelName].associate(db);
      }
    });
    db.sequelize = sequelize;
    db.Sequelize = Sequelize;

    isMssqlConnected = true;
    logger.info(`Connected to MSSQL DB`);
  })
  .catch((err) => {
    logger.error(err);
    isMssqlConnected = false;
  });

const isMsSQLConnected = () => {
  return isMssqlConnected;
};
module.exports = {
  db,
  sequelize,
  isMsSQLConnected,
};
