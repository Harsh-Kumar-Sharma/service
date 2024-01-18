const multer = require('multer');
const path = require('path');
const config = require('../config/config');

// Controller
const screenshotStorage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, path.join(config.uploadPath, 'screenshots'));
  },
  filename(req, file, callback) {
    callback(null, `${Date.now()}_${String(file.originalname).toLowerCase().replace(/\s/g, '_').trim()}`);
  },
});

const avatarStorage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, path.join(config.uploadPath, 'avatars'));
  },
  filename(req, file, callback) {
    callback(null, `${Date.now()}_${String(file.originalname).toLowerCase().replace(/\s/g, '_').trim()}`);
  },
});

const recordingStorage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, path.join(config.uploadPath, 'recordings'));
  },
  filename(req, file, callback) {
    callback(null, `${Date.now()}_${String(file.originalname).toLowerCase().replace(/\s/g, '_').trim()}`);
  },
});

// Filter
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image format', 400), false);
  }
};

// Handlers
const screenShotUploader = multer({
  storage: screenshotStorage,
  fileFilter: imageFilter,
}).single('file');

const avatarUploader = multer({
  storage: avatarStorage,
  fileFilter: imageFilter,
}).single('file');

const recordingsUploader = multer({
  storage: recordingStorage,
}).single('file');

module.exports = {
  screenShotUploader,
  avatarUploader,
  recordingsUploader,
};
