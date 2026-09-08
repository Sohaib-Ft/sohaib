const multer = require('multer');
const path = require('path');

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp|svg/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only!');
  }
}

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = upload;